<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // Pastikan user sudah login
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Harap login terlebih dahulu.'
            ], 401);
        }

        // Cek apakah role user ada di dalam daftar parameter role yang diperbolehkan
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Anda tidak memiliki akses ke fitur ini.'
            ], 403);
        }

        return $next($request);
    }
}