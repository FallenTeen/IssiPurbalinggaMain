<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar_url',
        'profile_data',
        'user_vector',
        'last_ml_update'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'profile_data' => 'array',
        'last_ml_update' => 'datetime',
    ];

    // hubungan
    public function articles()
    {
        return $this->hasMany(Artikel::class, 'reporter_id');
    }

    public function registrations()
    {
        return $this->hasMany(Registrasi::class);
    }

    public function interactions()
    {
        return $this->hasMany(InteraksiUser::class);
    }

    public function createdModels()
    {
        return $this->hasMany(ModelMl::class, 'created_by');
    }

    // Scopes
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeReporters($query)
    {
        return $query->where('role', 'reporter');
    }

    public function scopeActive($query)
    {
        return $query->whereNotNull('email_verified_at');
    }
    public function getNamaLengkapAttribute()
    {
        $roleMap = [
            'admin' => 'Admin',
            'reporter' => 'Reporter',
            'user' => 'User',
            'verifikator' => 'Verifikator'
        ];

        return $this->name . ' (' . ($roleMap[$this->role] ?? $this->role) . ')';
    }
    public function isReporter()
    {
        return $this->role === 'reporter';
    }
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    public function isVerifikator()
    {
        return $this->role === 'verifikator';
    }
    public function getStatistik()
    {
        return [
            'total_artikel' => $this->articles()->count(),
            'artikel_published' => $this->articles()->where('status', 'published')->count(),
            'total_registrasi' => $this->registrations()->count(),
            'registrasi_confirmed' => $this->registrations()->where('status', 'confirmed')->count(),
            'total_interaksi' => $this->interactions()->count(),
        ];
    }
}
