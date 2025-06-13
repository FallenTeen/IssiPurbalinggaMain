<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Traits\HasRoles;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            Log::warning('RoleMiddleware: User not authenticated. Redirecting to login. URL: ' . $request->fullUrl());
            return redirect()->route('login');
        }

        $user = Auth::user();
        $requiredRoles = [];
        foreach ($roles as $roleArg) {
            $parts = explode('|', $roleArg);
            $requiredRoles = array_merge($requiredRoles, $parts);
        }

        $requiredRoles = array_unique(array_map('trim', $requiredRoles));

        if ($user && $user->hasAnyRole($requiredRoles)) {
            Log::info('RoleMiddleware: Access granted for user ' . $user->id . '. User roles: [' . implode(', ', $user->getRoleNames()->toArray()) . ']. Required roles: [' . implode(', ', $requiredRoles) . ']');
            return $next($request);
        }

        Log::warning('RoleMiddleware: Access denied for user ' . $user->id . ' (User roles: [' . implode(', ', $user->getRoleNames()->toArray()) . ']) trying to access ' . $request->fullUrl() . '. Required roles: [' . implode(', ', $requiredRoles) . ']');
        abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
    }
}
