<?php

namespace App\Policies;

use App\Models\Artikel;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ArtikelPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reporter', 'verifikator']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Artikel $artikel): bool
    {
        if (!$user) {
            return $artikel->status === 'published';
        }

        return $user->hasAnyRole(['admin', 'verifikator']) ||
               ($user->hasRole('reporter') && $user->id === $artikel->reporter_id) ||
               ($artikel->status === 'published');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reporter', 'verifikator']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Artikel $artikel): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('verifikator')) {
            return true;
        }
        if ($user->hasRole('reporter')) {
            return $user->id === $artikel->reporter_id && $artikel->status !== 'published';
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Artikel $artikel): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can publish the model.
     */
    public function publish(User $user, Artikel $artikel): bool
    {
        return ($user->hasAnyRole(['admin', 'verifikator']) && $artikel->status !== 'published');
    }

    /**
     * Determine whether the user can archive the model.
     */
    public function archive(User $user, Artikel $artikel): bool
    {
        return ($user->hasAnyRole(['admin', 'verifikator']) && $artikel->status !== 'archived');
    }

    /**
     * Determine whether the user can reject the model.
     */
    public function reject(User $user, Artikel $artikel): bool
    {
        return $user->hasAnyRole(['admin', 'verifikator']) && in_array($artikel->status, ['review', 'published']);
    }
}
