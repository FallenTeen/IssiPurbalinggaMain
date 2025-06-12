<?php

namespace App\Http\Controllers;

use App\Models\Artikel;
use App\Models\KategoriArtikel;
use App\Models\User;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArtikelController extends Controller
{
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Artikel::with(['reporter', 'kategori']);

        if ($request->has('status') && in_array($request->status, ['draft', 'review', 'published', 'archived'])) {
            $query->withStatus($request->status);
        }

        if ($request->has('kategori_id')) {
            $query->byKategori($request->kategori_id);
        }

        if ($request->has('reporter_id')) {
            $query->byReporter($request->reporter_id);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('sort_by')) {
            if ($request->sort_by === 'popular') {
                $query->popular();
            } elseif ($request->sort_by === 'recent') {
                $query->recent();
            }
        } else {
            $query->recent();
        }

        $artikels = $query->paginate(10);

        return view('artikels.index', compact('artikels'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kategoris = KategoriArtikel::active()->get();
        $reporters = User::reporters()->get();
        return view('artikels.create', compact('kategoris', 'reporters'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'content' => 'required|string',
            'reporter_id' => 'required|exists:users,id',
            'kategori_id' => 'required|exists:kategori_artikel,id',
            'status' => 'required|in:draft,review,published,archived',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'tags' => 'nullable|string',
            'meta_description' => 'nullable|string|max:255',
            'tanggal_jadwal_publikasi' => 'nullable|date',
        ]);

        $artikelData = $request->except(['featured_image', 'gallery_images', 'tags']);
        $artikelData['slug'] = Artikel::generateUniqueSlug($request->judul);
        $artikelData['tags'] = $request->tags ? explode(',', $request->tags) : null;

        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('public/artikel_featured_images');
            $fileName = basename($path);
            $mimeType = $request->file('featured_image')->getMimeType();
            $folderId = config('services.google.drive.artikel_folder_id'); // Make sure this is configured
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

        if ($artikel->status === 'published' && !$request->tanggal_jadwal_publikasi) {
            $artikel->publish();
        } elseif ($artikel->status === 'published' && $request->tanggal_jadwal_publikasi) {
            $artikel->update(['tanggal_publikasi' => $request->tanggal_jadwal_publikasi]);
        }

        return redirect()->route('artikels.index')->with('success', 'Artikel berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Artikel $artikel)
    {
        $artikel->incrementView();
        return view('artikels.show', compact('artikel'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Artikel $artikel)
    {
        if (!$artikel->canBeEdited()) {
            return redirect()->route('artikels.show', $artikel)->with('error', 'Artikel tidak dapat diedit dalam status ini.');
        }

        $kategoris = KategoriArtikel::active()->get();
        $reporters = User::reporters()->get();
        return view('artikels.edit', compact('artikel', 'kategoris', 'reporters'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Artikel $artikel)
    {
        if (!$artikel->canBeEdited()) {
            return redirect()->route('artikels.show', $artikel)->with('error', 'Artikel tidak dapat diedit dalam status ini.');
        }

        $request->validate([
            'judul' => 'required|string|max:255',
            'content' => 'required|string',
            'reporter_id' => 'required|exists:users,id',
            'kategori_id' => 'required|exists:kategori_artikel,id',
            'status' => 'required|in:draft,review,published,archived',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'tags' => 'nullable|string',
            'meta_description' => 'nullable|string|max:255',
            'tanggal_jadwal_publikasi' => 'nullable|date',
        ]);

        $artikelData = $request->except(['featured_image', 'gallery_images', 'tags']);
        $artikelData['slug'] = Artikel::generateUniqueSlug($request->judul, $artikel->id);
        $artikelData['tags'] = $request->tags ? explode(',', $request->tags) : null;

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

        if ($artikel->status === 'published' && !$request->tanggal_jadwal_publikasi) {
            $artikel->publish();
        } elseif ($artikel->status === 'published' && $request->tanggal_jadwal_publikasi) {
            $artikel->update(['tanggal_publikasi' => $request->tanggal_jadwal_publikasi]);
        }

        return redirect()->route('artikels.show', $artikel)->with('success', 'Artikel berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Artikel $artikel)
    {
        $artikel->delete();
        return redirect()->route('artikels.index')->with('success', 'Artikel berhasil dihapus!');
    }

    /**
     * Publish the specified article.
     */
    public function publish(Artikel $artikel)
    {
        $artikel->publish();
        return redirect()->back()->with('success', 'Artikel berhasil dipublikasi!');
    }

    /**
     * Archive the specified article.
     */
    public function archive(Artikel $artikel)
    {
        $artikel->archive();
        return redirect()->back()->with('success', 'Artikel berhasil diarsipkan!');
    }
}
