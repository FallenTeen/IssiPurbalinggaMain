<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Artikel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'artikels';

    protected $fillable = [
        'judul',
        'slug',
        'content',
        'excerpt',
        'reporter_id',
        'kategori_id',
        'status',
        'featured_image_url',
        'gallery_urls',
        'tags',
        'meta_description',
        'reading_time',
        'jumlah_view',
        'jumlah_like',
        'jumlah_share',
        'tanggal_publikasi',
        'tanggal_jadwal_publikasi',
        'ml_category_prediction',
        'ml_confidence_score',
        'content_vector',
        'sentiment_score',
        'readability_score',
        'keywords_extracted',
        'event_terkait'
    ];

    protected $casts = [
        'gallery_urls' => 'array',
        'tags' => 'array',
        'tanggal_publikasi' => 'datetime',
        'tanggal_jadwal_publikasi' => 'datetime',
        'keywords_extracted' => 'array',
        'event_terkait' => 'array',
        'ml_confidence_score' => 'decimal:2',
        'sentiment_score' => 'decimal:2',
        'readability_score' => 'decimal:2',
        'jumlah_view' => 'integer',
        'jumlah_like' => 'integer',
        'jumlah_share' => 'integer',
        'reading_time' => 'integer',
    ];

    protected $dates = [
        'tanggal_publikasi',
        'tanggal_jadwal_publikasi',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Hubungannn
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriArtikel::class, 'kategori_id');
    }

    public function interactions()
    {
        return $this->hasMany(InteraksiUser::class, 'artikel_id');
    }

    // Scopes
    public function scopePublished(Builder $query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('tanggal_publikasi')
            ->where('tanggal_publikasi', '<=', now());
    }

    public function scopeByKategori(Builder $query, $kategoriId)
    {
        return $query->where('kategori_id', $kategoriId);
    }

    public function scopeByReporter(Builder $query, $reporterId)
    {
        return $query->where('reporter_id', $reporterId);
    }

    public function scopePopular(Builder $query)
    {
        return $query->orderBy('jumlah_view', 'desc');
    }

    public function scopeRecent(Builder $query)
    {
        return $query->orderBy('tanggal_publikasi', 'desc');
    }

    public function scopeWithStatus(Builder $query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch(Builder $query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('judul', 'LIKE', "%{$search}%")
                ->orWhere('content', 'LIKE', "%{$search}%")
                ->orWhere('excerpt', 'LIKE', "%{$search}%");
        });
    }

    // Accessors
    public function getWaktuBacaAttribute()
    {
        return $this->reading_time . ' menit';
    }

    public function getStatusLabelAttribute()
    {
        $statusMap = [
            'draft' => 'Draft',
            'review' => 'Dalam Review',
            'published' => 'Dipublikasi',
            'archived' => 'Diarsipkan'
        ];

        return $statusMap[$this->status] ?? $this->status;
    }

    public function getExcerptOrContentAttribute()
    {
        return $this->excerpt ?: Str::limit(strip_tags($this->content), 150);
    }

    public function getReadTimeEstimateAttribute()
    {
        $wordCount = str_word_count(strip_tags($this->content));
        return max(1, round($wordCount / 200));
    }

    public function getTotalInteractionsAttribute()
    {
        return $this->jumlah_view + $this->jumlah_like + $this->jumlah_share;
    }
    public function setJudulAttribute($value)
    {
        $this->attributes['judul'] = $value;
        if (!$this->slug) {
            $this->attributes['slug'] = Str::slug($value);
        }
    }

    public function setContentAttribute($value)
    {
        $this->attributes['content'] = $value;
        if (!$this->reading_time) {
            $wordCount = str_word_count(strip_tags($value));
            $this->attributes['reading_time'] = max(1, round($wordCount / 200));
        }
        if (!$this->excerpt) {
            $this->attributes['excerpt'] = Str::limit(strip_tags($value), 150);
        }
    }

    // Methods
    public function incrementView()
    {
        $this->increment('jumlah_view');
    }

    public function incrementLike()
    {
        $this->increment('jumlah_like');
    }

    public function decrementLike()
    {
        $this->decrement('jumlah_like');
    }

    public function incrementShare()
    {
        $this->increment('jumlah_share');
    }

    public function publish($publishAt = null)
    {
        $this->update([
            'status' => 'published',
            'tanggal_publikasi' => $publishAt ?: now()
        ]);
    }

    public function archive()
    {
        $this->update(['status' => 'archived']);
    }

    public function isPublished()
    {
        return $this->status === 'published' &&
            $this->tanggal_publikasi &&
            $this->tanggal_publikasi <= now();
    }

    public function canBeEdited()
    {
        return in_array($this->status, ['draft', 'review']);
    }

    public static function generateUniqueSlug($title, $id = null)
    {
        $slug = Str::slug($title);
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
