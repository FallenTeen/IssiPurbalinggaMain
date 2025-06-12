<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class ApiAuthController extends Controller
{
    /**
     * Handle API login and create token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'string|max:255',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user's email is verified (if you're using email verification)
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your email address is not verified.',
                'error' => 'email_not_verified'
            ], 403);
        }

        // Revoke all existing tokens for this user (optional - for single session)
        // $user->tokens()->delete();

        // Create token with abilities based on user role
        $abilities = $this->getTokenAbilities($user);

        $token = $user->createToken(
            $request->device_name ?? 'API Token',
            $abilities,
            now()->addDays(30) // Token expires in 30 days
        );

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
            ],
            'token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
        ]);
    }

    /**
     * Handle API logout
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Refresh token (create new token and revoke current)
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $request->user()->currentAccessToken();

        // Get device name from current token
        $deviceName = $currentToken->name;

        // Create new token with same abilities
        $abilities = $this->getTokenAbilities($user);
        $newToken = $user->createToken(
            $deviceName,
            $abilities,
            now()->addDays(30)
        );

        // Revoke current token
        $currentToken->delete();

        return response()->json([
            'message' => 'Token refreshed successfully',
            'token' => $newToken->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $newToken->accessToken->expires_at,
        ]);
    }

    /**
     * Get user's current tokens
     */
    public function tokens(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
            ];
        });

        return response()->json([
            'tokens' => $tokens
        ]);
    }

    /**
     * Revoke specific token
     */
    public function revokeToken(Request $request): JsonResponse
    {
        $request->validate([
            'token_id' => 'required|integer|exists:personal_access_tokens,id'
        ]);

        $token = $request->user()->tokens()->find($request->token_id);

        if (!$token) {
            return response()->json([
                'message' => 'Token not found'
            ], 404);
        }

        $token->delete();

        return response()->json([
            'message' => 'Token revoked successfully'
        ]);
    }

    /**
     * Revoke all tokens except current
     */
    public function revokeAllTokens(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;

        $request->user()->tokens()
            ->where('id', '!=', $currentTokenId)
            ->delete();

        return response()->json([
            'message' => 'All other tokens revoked successfully'
        ]);
    }

    /**
     * Get token abilities based on user role
     */
    private function getTokenAbilities(User $user): array
    {
        $abilities = ['read'];

        switch ($user->role) {
            case 'admin':
                $abilities = ['*']; // All abilities
                break;
            case 'verifikator':
                $abilities = [
                    'read',
                    'events:create',
                    'events:update',
                    'events:delete',
                    'registrations:manage'
                ];
                break;
            case 'reporter':
                $abilities = [
                    'read',
                    'articles:create',
                    'articles:update',
                    'articles:publish'
                ];
                break;
            default:
                $abilities = ['read'];
        }

        return $abilities;
    }
}
