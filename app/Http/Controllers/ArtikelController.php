<?php

namespace App\Http\Controllers;

use App\Models\Artikel;
use App\Models\KategoriArtikel;
use App\Models\User;
use App\Models\Event;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ArtikelController extends Controller
{
    use AuthorizesRequests;
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    public function index(Request $request)
    {
        $query = Artikel::with(['reporter', 'kategori']);

        if ($request->has('status') && in_array($request->status, ['draft', 'review', 'published', 'archived'])) {
            $query->where('status', $request->status);
        }

        if ($request->has('kategori_id') && $request->kategori_id !== 'all') {
            $query->where('kategori_id', $request->kategori_id);
        }

        if ($request->has('reporter_id') && $request->reporter_id !== 'all') {
            $query->where('reporter_id', $request->reporter_id);
        }

        if ($request->has('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('judul', 'like', $searchTerm)
                    ->orWhere('content', 'like', $searchTerm)
                    ->orWhereJsonContains('tags', $searchTerm);
            });
        }

        if ($request->has('sort_by')) {
            if ($request->sort_by === 'popular') {
                $query->orderBy('views_count', 'desc');
            } elseif ($request->sort_by === 'recent') {
                $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if (auth()->check()) {
            $user = auth()->user();
            if ($user->hasRole('reporter') && !$user->hasAnyRole(['admin', 'verifikator'])) {
                $query->where('reporter_id', $user->id);
            }
        } else {
            $query->where('status', 'published');
        }

        $artikels = $query->paginate(10);
        $kategoris = KategoriArtikel::active()->get(['id', 'nama']);
        $reporters = User::reporters()->get(['id', 'name']);

        return Inertia::render('artikel/index', [
            'artikels' => $artikels,
            'kategoris' => $kategoris,
            'reporters' => $reporters,
            'filters' => $request->only(['status', 'kategori_id', 'reporter_id', 'search', 'sort_by']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Artikel::class);

        $kategoris = KategoriArtikel::active()->get(['id', 'nama']);
        $reporters = User::reporters()->get(['id', 'name']);
        $events = Event::active()->get(['id', 'nama']);

        return Inertia::render('artikel/create', [
            'kategoris' => $kategoris,
            'reporters' => $reporters,
            'events' => $events,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Artikel::class);

        $validatedData = $request->validate([
            'judul' => 'required|string|max:255',
            'content' => 'required|string',
            'reporter_id' => 'required|exists:users,id',
            'kategori_id' => 'required|exists:kategori_artikels,id',
            'status' => 'required|in:draft,review,published,archived',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'meta_description' => 'nullable|string|max:255',
            'tanggal_jadwal_publikasi' => 'nullable|date',
            'event_terkait' => 'nullable|array',
            'event_terkait.*' => 'exists:events,id',
        ]);

        $user = auth()->user();
        if ($user->hasRole('reporter') && (int) $validatedData['reporter_id'] !== $user->id) {
            return redirect()->back()->withErrors(['reporter_id' => 'Anda hanya bisa membuat artikel atas nama Anda sendiri.']);
        }

        if ($user->hasRole('reporter') && !$user->hasAnyRole(['admin', 'verifikator'])) {
            $validatedData['status'] = 'review';
        }


        $artikelData = $validatedData;
        $artikelData['slug'] = Artikel::generateUniqueSlug($request->judul);
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('public/artikel_featured_images');
            $fileName = basename($path);
            $mimeType = $request->file('featured_image')->getMimeType();
            $folderId = config('services.google.drive.artikel_folder_id');
            $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
            $artikelData['featured_image_url'] = 'https://drive.google.com/uc?id=' . $fileId;
            Storage::delete($path);
        }

        $galleryUrls = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $path = $image->store('public/artikel_gallery_images');
                $fileName = basename($path);
                $mimeType = $image->getMimeType();
                $folderId = config('services.google.drive.artikel_gallery_folder_id');
                $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
                $galleryUrls[] = 'https://drive.google.com/uc?id=' . $fileId;
                Storage::delete($path);
            }
        }
        $artikelData['gallery_urls'] = $galleryUrls;

        $artikel = Artikel::create($artikelData);
        if ($artikel->status === 'published' && !$request->tanggal_jadwal_publikasi && $artikel->tanggal_publikasi === null) {
            if ($user->hasAnyRole(['admin', 'verifikator'])) {
                $artikel->publish();
            }
        } elseif ($artikel->status === 'published' && $request->tanggal_jadwal_publikasi) {
            $artikel->update(['tanggal_publikasi' => $request->tanggal_jadwal_publikasi]);
        }


        return redirect()->route('artikels.index')->with('success', 'Artikel berhasil ditambahkan!');
    }

    public function show(Artikel $artikel)
    {
        $this->authorize('view', $artikel);
        $artikel->load(['reporter', 'kategori']);
        $artikel->related_events = Event::whereIn('id', $artikel->event_terkait ?? [])->get();

        $artikel->incrementView();
        return Inertia::render('artikel/show', [
            'artikel' => $artikel,
        ]);
    }

    public function edit(Artikel $artikel)
    {
        $this->authorize('update', $artikel);
        $user = auth()->user();
        if ($user->hasRole('reporter') && $artikel->reporter_id === $user->id && $artikel->status === 'published') {
        }

        $kategoris = KategoriArtikel::active()->get(['id', 'nama']);
        $reporters = User::reporters()->get(['id', 'name']);
        $events = Event::active()->get(['id', 'nama']);

        return Inertia::render('artikel/edit', [
            'artikel' => $artikel,
            'kategoris' => $kategoris,
            'reporters' => $reporters,
            'events' => $events,
        ]);
    }

    public function update(Request $request, Artikel $artikel)
    {
        $this->authorize('update', $artikel);

        $user = auth()->user();
        $isReporterEditingPublishedOwnArticle = (
            $user->hasRole('reporter') &&
            $artikel->reporter_id === $user->id &&
            $artikel->isPublished()
        );

        $rules = [
            'judul' => 'required|string|max:255',
            'content' => 'required|string',
            'reporter_id' => 'required|exists:users,id',
            'kategori_id' => 'required|exists:kategori_artikels,id',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'meta_description' => 'nullable|string|max:255',
            'tanggal_jadwal_publikasi' => 'nullable|date',
            'event_terkait' => 'nullable|array',
            'event_terkait.*' => 'exists:events,id',
        ];

        if (!$isReporterEditingPublishedOwnArticle) {
            $rules['status'] = 'required|in:draft,review,published,archived';
        }

        $validatedData = $request->validate($rules);

        if ($user->hasRole('reporter') && (int) $validatedData['reporter_id'] !== $user->id) {
            return redirect()->back()->withErrors(['message' => 'Anda hanya bisa mengedit artikel Anda sendiri.']);
        }

        if ($isReporterEditingPublishedOwnArticle) {
            $validatedData['status'] = 'draft';
            $validatedData['tanggal_publikasi'] = null;
            $validatedData['rejection_reason'] = 'Artikel diubah oleh reporter setelah publikasi, status dikembalikan ke draft untuk review ulang.';
        } elseif ($user->hasRole('reporter') && isset($validatedData['status']) && $validatedData['status'] === 'published' && $artikel->status !== 'published' && !$user->hasAnyRole(['admin', 'verifikator'])) {
            $validatedData['status'] = 'review';
        }


        $artikelData = $validatedData;
        $artikelData['slug'] = Artikel::generateUniqueSlug($request->judul, $artikel->id);

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('public/artikel_featured_images');
            $fileName = basename($path);
            $mimeType = $request->file('featured_image')->getMimeType();
            $folderId = config('services.google.drive.artikel_folder_id');
            $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
            $artikelData['featured_image_url'] = 'https://drive.google.com/uc?id=' . $fileId;
            Storage::delete($path);
        }

        $galleryUrls = $artikel->gallery_urls ?? [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $path = $image->store('public/artikel_gallery_images');
                $fileName = basename($path);
                $mimeType = $image->getMimeType();
                $folderId = config('services.google.drive.artikel_gallery_folder_id');
                $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
                $galleryUrls[] = 'https://drive.google.com/uc?id=' . $fileId;
                Storage::delete($path);
            }
        }
        $artikelData['gallery_urls'] = $galleryUrls;

        $artikel->update($artikelData);

        if ($artikel->status === 'published' && !$request->tanggal_jadwal_publikasi && $artikel->tanggal_publikasi === null) {
            if ($user->hasAnyRole(['admin', 'verifikator'])) {
                $artikel->publish();
            }
        } elseif ($artikel->status === 'published' && $request->tanggal_jadwal_publikasi && $artikel->tanggal_publikasi != $request->tanggal_jadwal_publikasi) {
            $artikel->update(['tanggal_publikasi' => $request->tanggal_jadwal_publikasi]);
        }


        return redirect()->route('artikels.show', $artikel->slug)->with('success', 'Artikel berhasil diperbarui!');
    }

    public function destroy(Artikel $artikel)
    {
        $this->authorize('delete', $artikel);

        $artikel->delete();
        return redirect()->route('artikels.index')->with('success', 'Artikel berhasil dihapus!');
    }

    public function publish(Artikel $artikel)
    {
        $this->authorize('publish', $artikel);

        $artikel->publish();
        return redirect()->back()->with('success', 'Artikel berhasil dipublikasi!');
    }

    public function archive(Artikel $artikel)
    {
        $this->authorize('archive', $artikel);

        $artikel->archive();
        return redirect()->back()->with('success', 'Artikel berhasil diarsipkan!');
    }

    public function reject(Request $request, Artikel $artikel)
    {
        $this->authorize('reject', $artikel);

        $request->validate([
            'rejection_reason' => 'required|string|min:10|max:1000',
        ]);

        if (in_array($artikel->status, ['review', 'published', 'draft'])) {
            $artikel->update([
                'status' => 'draft',
                'rejection_reason' => $request->rejection_reason,
                'tanggal_publikasi' => null,
            ]);

            return redirect()->back()->with('success', 'Artikel berhasil ditolak dan dikembalikan ke draft.');
        }

        return redirect()->back()->with('error', 'Artikel tidak dapat ditolak dalam status ini.');
    }

    public function revise(Request $request, Artikel $artikel)
    {
        $this->authorize('revise', $artikel);

        $request->validate([
            'revision_reason' => 'required|string|min:10|max:1000',
        ]);

        if (in_array($artikel->status, ['published', 'archived', 'review'])) {
            $artikel->update([
                'status' => 'draft',
                'rejection_reason' => $request->revision_reason,
                'tanggal_publikasi' => null,
            ]);

            return redirect()->back()->with('success', 'Artikel berhasil dikembalikan untuk revisi.');
        }

        return redirect()->back()->with('error', 'Artikel tidak dapat direvisi dalam status ini.');
    }
}
