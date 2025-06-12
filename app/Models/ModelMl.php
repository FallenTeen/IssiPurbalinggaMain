<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class ModelMl extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nama_model',
        'tipe_model',
        'versi',
        'deskripsi',
        'model_path',
        'model_parameters',
        'training_data_info',
        'accuracy_score',
        'precision_score',
        'recall_score',
        'f1_score',
        'status',
        'is_active',
        'created_by',
        'last_trained_at',
        'training_samples',
        'validation_samples'
    ];

    protected $casts = [
        'model_parameters' => 'array',
        'training_data_info' => 'array',
        'accuracy_score' => 'decimal:4',
        'precision_score' => 'decimal:4',
        'recall_score' => 'decimal:4',
        'f1_score' => 'decimal:4',
        'is_active' => 'boolean',
        'last_trained_at' => 'datetime',
        'training_samples' => 'integer',
        'validation_samples' => 'integer',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType(Builder $query, $type)
    {
        return $query->where('tipe_model', $type);
    }

    public function scopeReady(Builder $query)
    {
        return $query->where('status', 'ready');
    }

    public function scopeLatestVersion(Builder $query)
    {
        return $query->orderBy('versi', 'desc');
    }

    // Methods
    public function activate()
    {
        // Deactivate other models of same type
        self::where('tipe_model', $this->tipe_model)
            ->where('id', '!=', $this->id)
            ->update(['is_active' => false]);

        $this->update(['is_active' => true]);
    }

    public function getPerformanceMetrics()
    {
        return [
            'accuracy' => $this->accuracy_score,
            'precision' => $this->precision_score,
            'recall' => $this->recall_score,
            'f1_score' => $this->f1_score,
        ];
    }

    public static function getActiveModelByType($type)
    {
        return self::active()
            ->byType($type)
            ->ready()
            ->first();
    }
}
