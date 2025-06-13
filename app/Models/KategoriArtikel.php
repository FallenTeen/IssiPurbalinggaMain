<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class KategoriArtikel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'kategori_artikels';

    protected $fillable = [
        'nama',
        'slug',
        'deskripsi',
        'color_code',
        'icon',
        'parent_id',
        'sort_order',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Hubungannn
    public function artikels()
    {
        return $this->hasMany(Artikel::class, 'kategori_id');
    }

    public function parent()
    {
        return $this->belongsTo(KategoriArtikel::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(KategoriArtikel::class, 'parent_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeParent($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOrderBySortOrder($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    // Accessor
    public function getJumlahArtikelAttribute()
    {
        return $this->artikels()->count();
    }
    public function getFullPathAttribute()
    {
        $path = collect([$this->nama]);
        $parent = $this->parent;

        while ($parent) {
            $path->prepend($parent->nama);
            $parent = $parent->parent;
        }

        return $path->implode(' > ');
    }

    // Mutator
    public function setNamaAttribute($value)
    {
        $this->attributes['nama'] = $value;
        $this->attributes['slug'] = \Str::slug($value);
    }
}
