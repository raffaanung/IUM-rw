<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warga;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class WargaController extends Controller
{
    // Ambil semua warga
    public function index(Request $request)
    {
        $warga = Warga::orderBy('nama', 'asc')->paginate(10);

        return $this->sendPaginatedResponse(
            $warga,
            'Data warga berhasil diambil.'
        );
    }

    // Detail warga
    public function show($id)
    {
        try {

            $warga = Warga::find($id);

            return response()->json([
                'success' => true,
                'data' => $warga
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // Tambah warga
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16|unique:warga,nik',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'alamat_sekarang' => 'required|string',
            'rt' => 'required|string',
            'rw' => 'required|string',
            'status_warga' => 'required|in:tetap,kontrak,pendatang',
            'status_pernikahan' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->sendError(
                'Validasi gagal.',
                $validator->errors(),
                422
            );
        }

        $warga = Warga::create(
            $request->except('password')
        );

        $baseUsername = trim($request->nama);
        $username = $baseUsername;
        $suffix = 1;
        while (User::where('username', $username)->exists()) {
            $suffix++;
            $username = $baseUsername . ' ' . $request->rt . ' ' . $suffix;
        }

        $userData = [
            'name' => $request->nama,
            'username' => $username,
            'email' => $request->nik . '@sitegar.com',
            'nik' => $request->nik,
            'password' => Hash::make($request->rt),
            'role' => 'warga',
            'rt' => $request->rt,
        ];
        if (Schema::hasColumn('users', 'warga_id')) {
            $userData['warga_id'] = $warga->id;
        }

        User::create($userData);

        return $this->sendResponse(
            $warga,
            'Warga berhasil ditambahkan.',
            201
        );
    }

    // Update warga
    public function update(Request $request, $id)
    {
        $warga = Warga::find($id);

        if (!$warga) {
            return $this->sendError(
                'Warga tidak ditemukan.',
                [],
                404
            );
        }

        $warga->update($request->all());

        return $this->sendResponse(
            $warga,
            'Data warga berhasil diupdate.'
        );
    }

    // Hapus warga
    public function destroy($id)
    {
        $warga = Warga::find($id);

        if (!$warga) {
            return $this->sendError(
                'Warga tidak ditemukan.',
                [],
                404
            );
        }

        if (Schema::hasColumn('users', 'warga_id')) {
            User::where('warga_id', $id)->delete();
        } else {
            User::where('nik', $warga->nik)->delete();
        }

        $warga->delete();

        return $this->sendResponse(
            [],
            'Warga berhasil dihapus.'
        );
    }
}
