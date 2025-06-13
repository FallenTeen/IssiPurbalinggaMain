<?php

namespace App\Policies;

use App\Models\Artikel;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ArtikelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reporter', 'verifikator']);
    }

    public function view(User $user, Artikel $artikel): bool
    {
        return $user->hasAnyRole(['admin', 'verifikator']) ||
            ($user->hasRole('reporter') && $user->id === $artikel->reporter_id) ||
            ($artikel->status === 'published');
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reporter']);
    }

    public function update(User $user, Artikel $artikel): bool
    {
        return $user->hasRole('admin') ||
            ($user->hasRole('reporter') && $user->id === $artikel->reporter_id) ||
            $user->hasRole('verifikator');
    }

    public function delete(User $user, Artikel $artikel): bool
    {
        return $user->hasRole('admin');
    }

    public function publish(User $user, Artikel $artikel): bool
    {
        return $user->hasAnyRole(['admin', 'verifikator']) &&
            in_array($artikel->status, ['draft', 'archived']);
    }

    public function archive(User $user, Artikel $artikel): bool
    {
        return $user->hasAnyRole(['admin', 'verifikator']) &&
            $artikel->status === 'published';
    }

    public function reject(User $user, Artikel $artikel)
    {
        return $user->hasAnyRole(['admin', 'verifikator']);
    }

    public function revise(User $user, Artikel $artikel)
    {
        return $user->hasAnyRole(['admin', 'verifikator']);
    }
}
