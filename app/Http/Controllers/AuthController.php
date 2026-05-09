<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Warga;

class AuthController extends Controller
{
    // Login
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
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
            ]
        ]);
    }

    // Register warga (signup sendiri)
    public function register(Request $request)
    {
        $request->validate([
            'username'          => 'required|string|unique:users,username',
            'nik'               => 'required|string|size:16|unique:users,nik',
            'nama'              => 'required|string',
            'password'          => 'required|string|min:6',
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
        $user = User::create([
            'name'     => $request->nama,
            'username' => $request->username,
            'email'    => $request->nik . '@sitegar.com',
            'nik'      => $request->nik,
            'password' => Hash::make($request->password),
            'role'     => 'warga',
            'rt'       => $request->rt,
            'warga_id' => $warga->id,
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