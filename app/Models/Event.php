<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nama',
        'slug',
        'type',
        'kategori',
        'tanggal_mulai',
        'tanggal_selesai',
        'lokasi',
        'deskripsi',
        'max_participants',
        'registration_fee',
        'difficulty_level',
        'requirements',
        'weather_dependency',
        'terrain_type',
        'elevation_gain',
        'jarak_km',
        'status',
        'banner_image_url',
        'gallery_urls',
        'event_features',
        'popularity_score',
        'success_rate'
    ];

    protected $casts = [
        'tanggal_mulai' => 'datetime',
        'tanggal_selesai' => 'datetime',
        'requirements' => 'array',
        'gallery_urls' => 'array',
        'event_features' => 'array',
        'weather_dependency' => 'boolean',
        'registration_fee' => 'decimal:2',
        'jarak_km' => 'decimal:2',
        'popularity_score' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'max_participants' => 'integer',
        'elevation_gain' => 'integer',
    ];

    protected $dates = [
        'tanggal_mulai',
        'tanggal_selesai',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relationships
    public function registrations()
    {
        return $this->hasMany(Registrasi::class, 'event_id');
    }

    public function confirmedRegistrations()
    {
        return $this->hasMany(Registrasi::class, 'event_id')->where('status', 'confirmed');
    }

    public function interactions()
    {
        return $this->hasMany(InteraksiUser::class, 'event_id');
    }

    // Scopes
    public function scopeActive(Builder $query)
    {
        return $query->where('status', 'published');
    }

    public function scopeUpcoming(Builder $query)
    {
        return $query->where('tanggal_mulai', '>', now());
    }

    public function scopePast(Builder $query)
    {
        return $query->where('tanggal_selesai', '<', now());
    }

    public function scopeOngoing(Builder $query)
    {
        return $query->where('tanggal_mulai', '<=', now())
            ->where('tanggal_selesai', '>=', now());
    }

    public function scopeByType(Builder $query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByKategori(Builder $query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeRegistrationOpen(Builder $query)
    {
        return $query->where('status', 'registration_open')
            ->where('tanggal_mulai', '>', now());
    }

    public function scopeByDifficulty(Builder $query, $difficulty)
    {
        return $query->where('difficulty_level', $difficulty);
    }

    public function scopeByTerrain(Builder $query, $terrain)
    {
        return $query->where('terrain_type', $terrain);
    }

    public function scopeSearch(Builder $query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nama', 'LIKE', "%{$search}%")
                ->orWhere('deskripsi', 'LIKE', "%{$search}%")
                ->orWhere('lokasi', 'LIKE', "%{$search}%");
        });
    }

    public function scopePopular(Builder $query)
    {
        return $query->orderBy('popularity_score', 'desc');
    }

    // Accessors
    public function getIsRegistrationOpenAttribute()
    {
        return $this->status === 'registration_open' &&
            $this->tanggal_mulai > now() &&
            $this->confirmedRegistrations()->count() < $this->max_participants;
    }

    public function getSisaKuotaAttribute()
    {
        return $this->max_participants - $this->confirmedRegistrations()->count();
    }

    public function getStatusLabelAttribute()
    {
        $statusMap = [
            'draft' => 'Draft',
            'published' => 'Dipublikasi',
            'registration_open' => 'Pendaftaran Dibuka',
            'registration_closed' => 'Pendaftaran Ditutup',
            'ongoing' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'cancelled' => 'Dibatalkan'
        ];

        return $statusMap[$this->status] ?? $this->status;
    }

    public function getDifficultyLabelAttribute()
    {
        $difficultyMap = [
            'easy' => 'Mudah',
            'medium' => 'Menengah',
            'hard' => 'Sulit',
            'expert' => 'Expert'
        ];

        return $difficultyMap[$this->difficulty_level] ?? $this->difficulty_level;
    }

    public function getTypeLabelAttribute()
    {
        $typeMap = [
            'downhill' => 'Downhill',
            'roadbike' => 'Road Bike',
            'unsupported' => 'Unsupported'
        ];

        return $typeMap[$this->type] ?? $this->type;
    }

    public function getKategoriLabelAttribute()
    {
        $kategoriMap = [
            'amatir' => 'Amatir',
            'professional' => 'Professional',
            'junior' => 'Junior',
            'senior' => 'Senior'
        ];

        return $kategoriMap[$this->kategori] ?? $this->kategori;
    }

    public function getDurationAttribute()
    {
        if (!$this->tanggal_mulai || !$this->tanggal_selesai) {
            return null;
        }

        return $this->tanggal_mulai->diffInDays($this->tanggal_selesai) + 1;
    }

    public function getIsUpcomingAttribute()
    {
        return $this->tanggal_mulai > now();
    }

    public function getIsOngoingAttribute()
    {
        return $this->tanggal_mulai <= now() && $this->tanggal_selesai >= now();
    }

    public function getIsPastAttribute()
    {
        return $this->tanggal_selesai < now();
    }

    public function getRegistrationPercentageAttribute()
    {
        $confirmed = $this->confirmedRegistrations()->count();
        return $this->max_participants > 0 ? round(($confirmed / $this->max_participants) * 100, 2) : 0;
    }

    // Mutators
    public function setNamaAttribute($value)
    {
        $this->attributes['nama'] = $value;
        if (!$this->slug) {
            $this->attributes['slug'] = Str::slug($value);
        }
    }

    // Methods
    public function canRegister()
    {
        return $this->is_registration_open && $this->sisa_kuota > 0;
    }

    public function openRegistration()
    {
        $this->update(['status' => 'registration_open']);
    }

    public function closeRegistration()
    {
        $this->update(['status' => 'registration_closed']);
    }

    public function start()
    {
        $this->update(['status' => 'ongoing']);
    }

    public function complete()
    {
        $this->update(['status' => 'completed']);
    }

    public function cancel()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function getRegistrationStats()
    {
        return [
            'total' => $this->registrations()->count(),
            'confirmed' => $this->confirmedRegistrations()->count(),
            'pending' => $this->registrations()->where('status', 'pending')->count(),
            'cancelled' => $this->registrations()->where('status', 'cancelled')->count(),
            'quota_used_percentage' => $this->registration_percentage,
            'remaining_quota' => $this->sisa_kuota
        ];
    }

    // Static methods
    public static function generateUniqueSlug($name, $id = null)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (
            self::where('slug', $slug)->when($id, function ($query) use ($id) {
                $query->where('id', '!=', $id);
            })->exists()
        ) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
