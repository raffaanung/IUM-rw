<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Warga;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class WargaController extends Controller
{
    // Ambil semua warga
    public function index(Request $request)
    {
        $user = $request->user();

        // RT hanya bisa lihat warga di RT-nya
        if ($user->role === 'rt') {
            $warga = Warga::where('rt', $user->rt)->get();
        } else {
            // RW bisa lihat semua
            $warga = Warga::all();
        }

        return response()->json($warga);
    }

    // Detail satu warga
    public function show($id)
    {
        $warga = Warga::find($id);

        if (!$warga) {
            return response()->json(['message' => 'Warga tidak ditemukan'], 404);
        }

        return response()->json($warga);
    }

    // Tambah warga baru (oleh RT/RW)
    public function store(Request $request)
    {
        $request->validate([
            'nik'               => 'required|string|size:16|unique:warga,nik',
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
            'password'          => 'required|string|min:6',
        ]);

        $warga = Warga::create($request->except('password'));

        // Buat akun user untuk warga
        User::create([
            'name'     => $request->nama,
            'email'    => $request->nik . '@sitegar.com',
            'nik'      => $request->nik,
            'password' => Hash::make($request->password),
            'role'     => 'warga',
            'rt'       => $request->rt,
            'warga_id' => $warga->id,
        ]);

        return response()->json([
            'message' => 'Warga berhasil ditambahkan',
            'warga'   => $warga
        ], 201);
    }

    // Edit data warga
    public function update(Request $request, $id)
    {
        $warga = Warga::find($id);

        if (!$warga) {
            return response()->json(['message' => 'Warga tidak ditemukan'], 404);
        }

        $request->validate([
            'nik'               => 'sometimes|string|size:16|unique:warga,nik,' . $id,
            'nama'              => 'sometimes|string',
            'jenis_kelamin'     => 'sometimes|in:L,P',
            'tempat_lahir'      => 'sometimes|string',
            'tanggal_lahir'     => 'sometimes|date',
            'alamat'            => 'sometimes|string',
            'rt'                => 'sometimes|string',
            'rw'                => 'sometimes|string',
            'status_warga'      => 'sometimes|in:tetap,kontrak,pendatang',
            'status_pernikahan' => 'sometimes|in:belum_menikah,menikah,cerai',
            'pekerjaan'         => 'nullable|string',
            'no_hp'             => 'nullable|string',
        ]);

        $warga->update($request->all());

        return response()->json([
            'message' => 'Data warga berhasil diupdate',
            'warga'   => $warga
        ]);
    }

    // Hapus warga
    public function destroy($id)
    {
        $warga = Warga::find($id);

        if (!$warga) {
            return response()->json(['message' => 'Warga tidak ditemukan'], 404);
        }

        // Hapus akun user terkait
        User::where('warga_id', $id)->delete();
        $warga->delete();

        return response()->json([
            'message' => 'Warga berhasil dihapus'
        ]);
    }
}