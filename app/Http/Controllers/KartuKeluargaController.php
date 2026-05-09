<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KartuKeluarga;
use App\Models\AnggotaKk;

class KartuKeluargaController extends Controller
{
    // Ambil semua KK
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'rt') {
            $kk = KartuKeluarga::where('rt', $user->rt)->get();
        } else {
            $kk = KartuKeluarga::all();
        }

        return response()->json($kk);
    }

    // Detail satu KK beserta anggotanya
    public function show($id)
    {
        $kk = KartuKeluarga::with(['warga' => function ($query) {
            $query->withPivot('hubungan_keluarga');
        }])->find($id);

        if (!$kk) {
            return response()->json(['message' => 'Kartu Keluarga tidak ditemukan'], 404);
        }

        return response()->json($kk);
    }

    // Tambah KK baru
    public function store(Request $request)
    {
        $request->validate([
            'no_kk'           => 'required|string|size:16|unique:kartu_keluarga,no_kk',
            'kepala_keluarga' => 'required|string',
            'alamat'          => 'required|string',
            'rt'              => 'required|string',
            'rw'              => 'required|string',
        ]);

        $kk = KartuKeluarga::create($request->all());

        return response()->json([
            'message' => 'Kartu Keluarga berhasil ditambahkan',
            'kk'      => $kk
        ], 201);
    }

    // Edit KK
    public function update(Request $request, $id)
    {
        $kk = KartuKeluarga::find($id);

        if (!$kk) {
            return response()->json(['message' => 'Kartu Keluarga tidak ditemukan'], 404);
        }

        $request->validate([
            'no_kk'           => 'sometimes|string|size:16|unique:kartu_keluarga,no_kk,' . $id,
            'kepala_keluarga' => 'sometimes|string',
            'alamat'          => 'sometimes|string',
            'rt'              => 'sometimes|string',
            'rw'              => 'sometimes|string',
        ]);

        $kk->update($request->all());

        return response()->json([
            'message' => 'Kartu Keluarga berhasil diupdate',
            'kk'      => $kk
        ]);
    }

    // Hapus KK
    public function destroy($id)
    {
        $kk = KartuKeluarga::find($id);

        if (!$kk) {
            return response()->json(['message' => 'Kartu Keluarga tidak ditemukan'], 404);
        }

        $kk->delete();

        return response()->json([
            'message' => 'Kartu Keluarga berhasil dihapus'
        ]);
    }

    // Tambah anggota ke KK
    public function tambahAnggota(Request $request, $id)
    {
        $request->validate([
            'warga_id'          => 'required|exists:warga,id',
            'hubungan_keluarga' => 'required|string',
        ]);

        $kk = KartuKeluarga::find($id);

        if (!$kk) {
            return response()->json(['message' => 'Kartu Keluarga tidak ditemukan'], 404);
        }

        AnggotaKk::create([
            'kartu_keluarga_id' => $id,
            'warga_id'          => $request->warga_id,
            'hubungan_keluarga' => $request->hubungan_keluarga,
        ]);

        return response()->json([
            'message' => 'Anggota berhasil ditambahkan'
        ], 201);
    }

    // Hapus anggota dari KK
    public function hapusAnggota($kkId, $wargaId)
    {
        AnggotaKk::where('kartu_keluarga_id', $kkId)
                 ->where('warga_id', $wargaId)
                 ->delete();

        return response()->json([
            'message' => 'Anggota berhasil dihapus dari KK'
        ]);
    }
}