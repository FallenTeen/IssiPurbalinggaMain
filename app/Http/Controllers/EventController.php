<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia; // Import Inertia

class EventController extends Controller
{
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    public function index(Request $request)
    {
        $query = Event::query();

        if ($request->has('status')) {
            if ($request->status === 'upcoming')
                $query->upcoming();
            elseif ($request->status === 'past')
                $query->past();
            elseif ($request->status === 'ongoing')
                $query->ongoing();
            else
                $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('kategori')) {
            $query->byKategori($request->kategori);
        }

        if ($request->has('difficulty')) {
            $query->byDifficulty($request->difficulty);
        }

        if ($request->has('terrain')) {
            $query->byTerrain($request->terrain);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('sort_by') && $request->sort_by === 'popular') {
            $query->popular();
        } else {
            $query->orderBy('tanggal_mulai', 'asc');
        }

        $events = $query->paginate(10);

        return Inertia::render('event/index', [
            'events' => $events,
            'filters' => $request->all()
        ]);
    }

    public function create()
    {
        return Inertia::render('event/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'type' => 'required|in:downhill,roadbike,unsupported',
            'kategori' => 'required|in:amatir,professional,junior,senior',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'lokasi' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'nullable|numeric|min:0',
            'difficulty_level' => 'required|in:easy,medium,hard,expert',
            'requirements' => 'nullable|array',
            'weather_dependency' => 'boolean',
            'terrain_type' => 'required|in:road,mountain,mixed',
            'elevation_gain' => 'nullable|integer|min:0',
            'jarak_km' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,published,registration_open,registration_closed,ongoing,completed,cancelled',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'event_features' => 'nullable|array',
        ]);

        $eventData = $request->except(['banner_image', 'gallery_images', 'requirements', 'event_features']);
        $eventData['slug'] = Event::generateUniqueSlug($request->nama);
        $eventData['requirements'] = json_encode($request->requirements);
        $eventData['event_features'] = json_encode($request->event_features);

        if ($request->hasFile('banner_image')) {
            $path = $request->file('banner_image')->store('public/event_banners');
            $fileName = basename($path);
            $mimeType = $request->file('banner_image')->getMimeType();
            $folderId = config('services.google.drive.event_banner_folder_id');
            $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
            $eventData['banner_image_url'] = 'https://drive.google.com/uc?id=' . $fileId;
            Storage::delete($path);
        }

        $galleryUrls = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $path = $image->store('public/event_galleries');
                $fileName = basename($path);
                $mimeType = $image->getMimeType();
                $folderId = config('services.google.drive.event_gallery_folder_id');
                $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
                $galleryUrls[] = 'https://drive.google.com/uc?id=' . $fileId;
                Storage::delete($path);
            }
        }
        $eventData['gallery_urls'] = $galleryUrls;

        $event = Event::create($eventData);

        return redirect()->route('events.index')->with('success', 'Event berhasil ditambahkan!');
    }

    public function show(Event $event)
    {
        return Inertia::render('event/show', compact('event'));
    }

    public function edit(Event $event)
    {
        return Inertia::render('event/edit', compact('event'));
    }

    public function update(Request $request, Event $event)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'type' => 'required|in:downhill,roadbike,unsupported',
            'kategori' => 'required|in:amatir,professional,junior,senior',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'lokasi' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'max_participants' => 'nullable|integer|min:1',
            'registration_fee' => 'nullable|numeric|min:0',
            'difficulty_level' => 'required|in:easy,medium,hard,expert',
            'requirements' => 'nullable|array',
            'weather_dependency' => 'boolean',
            'terrain_type' => 'required|in:road,mountain,mixed',
            'elevation_gain' => 'nullable|integer|min:0',
            'jarak_km' => 'nullable|numeric|min:0',
            'status' => 'required|in:draft,published,registration_open,registration_closed,ongoing,completed,cancelled',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'gallery_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'event_features' => 'nullable|array',
        ]);

        $eventData = $request->except(['banner_image', 'gallery_images', 'requirements', 'event_features']);
        $eventData['slug'] = Event::generateUniqueSlug($request->nama, $event->id);
        $eventData['requirements'] = json_encode($request->requirements);
        $eventData['event_features'] = json_encode($request->event_features);

        if ($request->hasFile('banner_image')) {
            $path = $request->file('banner_image')->store('public/event_banners');
            $fileName = basename($path);
            $mimeType = $request->file('banner_image')->getMimeType();
            $folderId = config('services.google.drive.event_banner_folder_id');
            $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
            $eventData['banner_image_url'] = 'https://drive.google.com/uc?id=' . $fileId;
            Storage::delete($path);
        }

        $galleryUrls = $event->gallery_urls ?? [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $image) {
                $path = $image->store('public/event_galleries');
                $fileName = basename($path);
                $mimeType = $image->getMimeType();
                $folderId = config('services.google.drive.event_gallery_folder_id');
                $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
                $galleryUrls[] = 'https://drive.google.com/uc?id=' . $fileId;
                Storage::delete($path);
            }
        }
        $eventData['gallery_urls'] = $galleryUrls;

        $event->update($eventData);

        return redirect()->route('events.show', $event->slug)->with('success', 'Event berhasil diperbarui!');
    }

    public function destroy(Event $event)
    {
        if ($event->registrations()->exists()) {
            return redirect()->back()->with('error', 'Event tidak dapat dihapus karena memiliki registrasi terkait.');
        }
        $event->delete();
        return redirect()->route('event.index')->with('success', 'Event berhasil dihapus!');
    }

    public function openRegistration(Event $event)
    {
        $event->openRegistration();
        return redirect()->back()->with('success', 'Pendaftaran event berhasil dibuka!');
    }

    public function closeRegistration(Event $event)
    {
        $event->closeRegistration();
        return redirect()->back()->with('success', 'Pendaftaran event berhasil ditutup!');
    }

    public function startEvent(Event $event)
    {
        $event->start();
        return redirect()->back()->with('success', 'Event berhasil dimulai!');
    }

    public function completeEvent(Event $event)
    {
        $event->complete();
        return redirect()->back()->with('success', 'Event berhasil diselesaikan!');
    }

    public function cancelEvent(Event $event)
    {
        $event->cancel();
        return redirect()->back()->with('success', 'Event berhasil dibatalkan!');
    }
}
