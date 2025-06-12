<?php

namespace App\Http\Controllers;

use App\Models\Registrasi;
use App\Models\Event;
use App\Models\User;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class RegistrasiController extends Controller
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
        $query = Registrasi::with(['user', 'event']);

        if ($request->has('event_id')) {
            $query->byEvent($request->event_id);
        }

        if ($request->has('status')) {
            if ($request->status === 'confirmed') {
                $query->confirmed();
            } elseif ($request->status === 'pending') {
                $query->pending();
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('payment_status')) {
            $query->byPaymentStatus($request->payment_status);
        }

        $registrations = $query->latest()->paginate(10);

        return view('registrations.index', compact('registrations'));
    }

    /**
     * Show the form for creating a new registration for an event.
     */
    public function create(Event $event)
    {
        if (!$event->canRegister()) {
            return redirect()->route('events.show', $event)->with('error', 'Pendaftaran untuk event ini sudah ditutup atau kuota penuh.');
        }
        return view('registrations.create', compact('event'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Event $event)
    {
        if (!$event->canRegister()) {
            return redirect()->route('events.show', $event)->with('error', 'Pendaftaran untuk event ini sudah ditutup atau kuota penuh.');
        }

        $request->validate([
            'data_registrasi' => 'required|array',
            'kontak_darurat' => 'required|array',
            'kondisi_medis' => 'nullable|array',
            'pengalaman' => 'nullable|string',
            'spesifikasi_sepeda' => 'nullable|array',
            'nama_tim' => 'nullable|string|max:255',
            'metode_pembayaran' => 'required|string',
            'bukti_pembayaran' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120', // 5MB
            'notes' => 'nullable|string',
        ]);

        $registrationData = $request->except(['bukti_pembayaran']);
        $registrationData['user_id'] = Auth::id();
        $registrationData['event_id'] = $event->id;
        $registrationData['kode_registrasi'] = Registrasi::generateRegistrationCode($event->id);
        $registrationData['status'] = 'pending';
        $registrationData['status_pembayaran'] = 'pending';
        $registrationData['biaya_pendaftaran'] = $event->registration_fee;
        $registrationData['data_registrasi'] = json_encode($request->data_registrasi);
        $registrationData['kontak_darurat'] = json_encode($request->kontak_darurat);
        $registrationData['kondisi_medis'] = json_encode($request->kondisi_medis);
        $registrationData['spesifikasi_sepeda'] = json_encode($request->spesifikasi_sepeda);


        if ($request->hasFile('bukti_pembayaran')) {
            $path = $request->file('bukti_pembayaran')->store('public/payment_proofs');
            $fileName = basename($path);
            $mimeType = $request->file('bukti_pembayaran')->getMimeType();
            $folderId = config('services.google.drive.payment_proof_folder_id'); // Make sure this is configured
            $fileId = $this->googleDriveService->uploadFile(Storage::path($path), $fileName, $mimeType, $folderId);
            $registrationData['bukti_pembayaran'] = 'https://drive.google.com/uc?id=' . $fileId;
            Storage::delete($path);
        }

        Registrasi::create($registrationData);

        return redirect()->route('events.show', $event)->with('success', 'Pendaftaran Anda berhasil. Menunggu konfirmasi pembayaran.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Registrasi $registrasi)
    {
        return view('registrations.show', compact('registrasi'));
    }

    /**
     * Confirm the specified registration.
     */
    public function confirm(Registrasi $registrasi)
    {
        $registrasi->confirm();
        return redirect()->back()->with('success', 'Registrasi berhasil dikonfirmasi!');
    }

    /**
     * Cancel the specified registration.
     */
    public function cancel(Registrasi $registrasi)
    {
        $registrasi->cancel();
        return redirect()->back()->with('success', 'Registrasi berhasil dibatalkan!');
    }

    /**
     * Update payment status.
     */
    public function updatePaymentStatus(Request $request, Registrasi $registrasi)
    {
        $request->validate([
            'status_pembayaran' => 'required|in:pending,paid,failed,refunded',
        ]);

        $registrasi->update(['status_pembayaran' => $request->status_pembayaran]);

        return redirect()->back()->with('success', 'Status pembayaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Registrasi $registrasi)
    {
        $registrasi->delete();
        return redirect()->route('registrations.index')->with('success', 'Registrasi berhasil dihapus!');
    }
}
