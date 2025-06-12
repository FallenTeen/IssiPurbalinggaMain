<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenAbilities
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $ability): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $token = $user->currentAccessToken();

        if (!$token) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        if (!$token->can($ability) && !$token->can('*')) {
            return response()->json([
                'message' => 'Insufficient permissions',
                'required_ability' => $ability
            ], 403);
        }

        return $next($request);
    }
}
