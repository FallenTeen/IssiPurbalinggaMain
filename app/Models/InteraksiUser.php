<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class InteraksiUser extends Model
{
    use HasFactory;

    protected $table = 'interaksi_user';

    protected $fillable = [
        'user_id',
        'artikel_id',
        'event_id',
        'tipe_interaksi',
        'interaction_value',
        'metadata',
        'durasi_baca',
        'device_type',
        'user_agent',
        'ip_address'
    ];

    protected $casts = [
        'metadata' => 'array',
        'durasi_baca' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function artikel()
    {
        return $this->belongsTo(Artikel::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    // Scopes
    public function scopeByType(Builder $query, $type)
    {
        return $query->where('tipe_interaksi', $type);
    }

    public function scopeByUser(Builder $query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByArtikel(Builder $query, $artikelId)
    {
        return $query->where('artikel_id', $artikelId);
    }

    public function scopeByEvent(Builder $query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    public function scopeToday(Builder $query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisWeek(Builder $query)
    {
        return $query->whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public static function recordInteraction($data)
    {
        return self::create([
            'user_id' => $data['user_id'] ?? null,
            'artikel_id' => $data['artikel_id'] ?? null,
            'event_id' => $data['event_id'] ?? null,
            'tipe_interaksi' => $data['tipe_interaksi'],
            'interaction_value' => $data['interaction_value'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'durasi_baca' => $data['durasi_baca'] ?? null,
            'device_type' => $data['device_type'] ?? null,
            'user_agent' => request()->userAgent(),
            'ip_address' => request()->ip()
        ]);
    }
}
