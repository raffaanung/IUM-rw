<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Warga;
use App\Models\KartuKeluarga;
use Illuminate\Support\Facades\Schema;

class AuthController extends Controller
{
    // Public Stats for Login Page
    public function publicStats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_warga' => Warga::count(),
                'total_kk'    => KartuKeluarga::count(),
                'total_rt'    => 8, // Fixed to 8 as requested
            ]
        ]);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $inputUsername = trim((string) $request->username);
        $inputPassword = trim((string) $request->password);

        $normalizeRt = function (?string $value) {
            if ($value === null) return null;
            $digits = preg_replace('/\D+/', '', $value);
            if (!$digits) return null;
            if (strlen($digits) === 1) $digits = '0' . $digits;
            return substr($digits, -2);
        };

        $requestedRt = $normalizeRt($inputPassword);

        $user = User::where('username', $inputUsername)->first();
        if (!$user) {
            $q = User::where('role', 'warga')
                ->where(function ($qq) use ($inputUsername) {
                    $u = strtolower($inputUsername);
                    $qq->whereRaw('LOWER(name) = ?', [$u])
                        ->orWhereRaw('LOWER(username) = ?', [$u]);
                });

            if ($requestedRt) {
                $rtCandidates = array_values(array_unique(array_filter([
                    $requestedRt,
                    ltrim($requestedRt, '0'),
                    'RT ' . $requestedRt,
                    'RT' . $requestedRt,
                ])));
                $q->where(function ($qq) use ($rtCandidates) {
                    foreach ($rtCandidates as $rtVal) {
                        $qq->orWhere('rt', $rtVal);
                    }
                });
            }

            $user = $q->first();
        }

        if (!$user && $requestedRt) {
            $warga = Warga::whereRaw('LOWER(TRIM(nama)) = ?', [strtolower($inputUsername)])
                ->get(['id', 'nama', 'nik', 'rt'])
                ->first(function ($w) use ($normalizeRt, $requestedRt) {
                    return $requestedRt && $normalizeRt($w->rt) === $requestedRt;
                });

            if ($warga) {
                $user = User::where('role', 'warga')->where('nik', $warga->nik)->first();

                if (!$user) {
                    $baseUsername = trim((string) $warga->nama);
                    $username = $baseUsername;
                    $suffix = 1;
                    while (User::where('username', $username)->exists()) {
                        $suffix++;
                        $username = $baseUsername . ' ' . $requestedRt . ' ' . $suffix;
                    }

                    $userData = [
                        'name' => $warga->nama,
                        'username' => $username,
                        'email' => $warga->nik . '@sitegar.com',
                        'nik' => $warga->nik,
                        'password' => Hash::make($requestedRt),
                        'role' => 'warga',
                        'rt' => $requestedRt,
                    ];

                    if (Schema::hasColumn('users', 'warga_id')) {
                        $userData['warga_id'] = $warga->id;
                    }

                    $user = User::create($userData);
                } else {
                    $userRt = $normalizeRt($user->rt);
                    if (!$userRt || $userRt !== $requestedRt) {
                        $user->rt = $requestedRt;
                        $user->save();
                    }
                }
            }
        }

        if (!$user) {
            return response()->json([
                'message' => 'Username atau password salah'
            ], 401);
        }

        $ok = false;
        if ($user->role === 'warga') {
            $userRt = $normalizeRt($user->rt);
            $profilRt = null;
            if ($user->nik) {
                $profil = Warga::where('nik', $user->nik)->first();
                $profilRt = $normalizeRt($profil ? $profil->rt : null);
            }

            $rtToCheck = $profilRt ?: $userRt;
            $ok = ($requestedRt && $rtToCheck && $requestedRt === $rtToCheck);
        } else {
            $ok = Hash::check($inputPassword, $user->password);
        }

        if (!$ok) {
            return response()->json([
                'message' => 'Username atau password salah'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'nik'      => $user->nik,
                'role'     => $user->role,
                'rt'       => $user->rt,
                'warga_id' => Schema::hasColumn('users', 'warga_id') ? $user->warga_id : null,
            ]
        ]);
    }

    // Register warga (signup sendiri)
    public function register(Request $request)
    {
        $request->validate([
            'nik'               => 'required|string|size:16|unique:users,nik',
            'nama'              => 'required|string',
            'jenis_kelamin'     => 'required|in:L,P',
            'tempat_lahir'      => 'required|string',
            'tanggal_lahir'     => 'required|date',
            'alamat'            => 'required|string',
            'rt'                => 'required|string',
            'rw'                => 'required|string',
            'status_warga'      => 'required|in:tetap,kontrak,pendatang',
            'status_pernikahan' => 'required|in:belum_menikah,menikah,cerai',
            'pekerjaan'         => 'nullable|string',
            'no_hp'             => 'nullable|string',
        ]);

        // Simpan data warga
        $warga = Warga::create([
            'nik'               => $request->nik,
            'nama'              => $request->nama,
            'jenis_kelamin'     => $request->jenis_kelamin,
            'tempat_lahir'      => $request->tempat_lahir,
            'tanggal_lahir'     => $request->tanggal_lahir,
            'alamat'            => $request->alamat,
            'rt'                => $request->rt,
            'rw'                => $request->rw,
            'status_warga'      => $request->status_warga,
            'status_pernikahan' => $request->status_pernikahan,
            'pekerjaan'         => $request->pekerjaan,
            'no_hp'             => $request->no_hp,
        ]);

        // Buat akun user untuk warga
        $baseUsername = trim($request->nama);
        $username = $baseUsername;
        $suffix = 1;
        while (User::where('username', $username)->exists()) {
            $suffix++;
            $username = $baseUsername . ' ' . $request->rt . ' ' . $suffix;
        }

        $userData = [
            'name'     => $request->nama,
            'username' => $username,
            'email'    => $request->nik . '@sitegar.com',
            'nik'      => $request->nik,
            'password' => Hash::make($request->rt),
            'role'     => 'warga',
            'rt'       => $request->rt,
        ];
        if (Schema::hasColumn('users', 'warga_id')) {
            $userData['warga_id'] = $warga->id;
        }

        $user = User::create([
            ...$userData,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'username' => $user->username,
                'nik'      => $user->nik,
                'role'     => $user->role,
                'rt'       => $user->rt,
            ]
        ], 201);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    // Data user yang sedang login
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}
