<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Registrasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'registrasis';

    protected $fillable = [
        'user_id',
        'event_id',
        'kode_registrasi',
        'status',
        'status_pembayaran',
        'metode_pembayaran',
        'bukti_pembayaran',
        'data_registrasi',
        'kontak_darurat',
        'kondisi_medis',
        'pengalaman',
        'spesifikasi_sepeda',
        'nama_tim',
        'biaya_pendaftaran',
        'notes',
        'diterima_pada',
        'ditolak_pada',
    ];

    protected $casts = [
        'data_registrasi' => 'array',
        'kontak_darurat' => 'array',
        'kondisi_medis' => 'array',
        'spesifikasi_sepeda' => 'array',
        'biaya_pendaftaran' => 'decimal:2',
        'diterima_pada' => 'datetime',
        'ditolak_pada' => 'datetime',
    ];

    // Hubungan
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('status_pembayaran', $status);
    }

    public function scopeByEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    // Accessor
    public function getStatusPembayaranLengkapAttribute()
    {
        $statusMap = [
            'pending' => 'Menunggu Pembayaran',
            'paid' => 'Sudah Dibayar',
            'failed' => 'Pembayaran Gagal',
            'refunded' => 'Sudah Direfund'
        ];

        return $statusMap[$this->status_pembayaran] ?? $this->status_pembayaran;
    }

    // Accessor
    public function getStatusRegistrasiLengkapAttribute()
    {
        $statusMap = [
            'pending' => 'Menunggu Konfirmasi',
            'confirmed' => 'Terkonfirmasi',
            'cancelled' => 'Dibatalkan',
            'completed' => 'Selesai'
        ];

        return $statusMap[$this->status] ?? $this->status;
    }

    public static function generateRegistrationCode($eventId)
    {
        $event = Event::find($eventId);
        $prefix = strtoupper(substr($event->slug, 0, 3));
        $timestamp = now()->format('ymd');
        $random = str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        return $prefix . $timestamp . $random;
    }

    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
            'diterima_pada' => now()
        ]);
    }

    public function cancel()
    {
        $this->update([
            'status' => 'cancelled',
            'ditolak_pada' => now()
        ]);
    }
}
