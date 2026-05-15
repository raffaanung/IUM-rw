<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warga;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class WargaController extends Controller
{
    /**
     * Menampilkan daftar warga di RT Admin.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        $query = Warga::where('rt', $admin->rt);

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('nama', 'LIKE', "%{$request->search}%")
                  ->orWhere('nik', 'LIKE', "%{$request->search}%");
            });
        }
        if ($request->filled('status_warga')) {
            $query->where('status_warga', $request->status_warga);
        }
        if ($request->filled('jenis_kelamin')) {
            $query->where('jenis_kelamin', $request->jenis_kelamin);
        }

        $perPage = $request->input('limit', 10);
        $wargaList = $query->orderBy('nama', 'asc')->paginate($perPage);

        return $this->sendPaginatedResponse($wargaList, 'Daftar warga berhasil diambil.');
    }

    /**
     * Menambahkan warga baru ke RT Admin.
     */
    public function store(Request $request)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16|unique:warga,nik',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'status_warga' => 'required|in:tetap,kontrak,pendatang',
            'tempat_lahir' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'alamat' => 'required|string',
            'rw' => 'required|string',
            'status_pernikahan' => 'required|in:belum_menikah,menikah,cerai',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->all();
        // Override RT secara paksa untuk keamanan (Ownership)
        $data['rt'] = $admin->rt; 
        
        $warga = Warga::create($data);

        $baseUsername = trim($warga->nama);
        $username = $baseUsername;
        $suffix = 1;
        while (User::where('username', $username)->exists()) {
            $suffix++;
            $username = $baseUsername . ' ' . $admin->rt . ' ' . $suffix;
        }

        $userData = [
            'name' => $warga->nama,
            'username' => $username,
            'email' => $warga->nik . '@sitegar.com',
            'nik' => $warga->nik,
            'password' => Hash::make($admin->rt),
            'role' => 'warga',
            'rt' => $admin->rt,
        ];
        if (Schema::hasColumn('users', 'warga_id')) {
            $userData['warga_id'] = $warga->id;
        }

        User::create($userData);

        return $this->sendResponse($warga, 'Warga berhasil ditambahkan.', 201);
    }

    /**
     * Menampilkan detail warga.
     */
    public function show(Request $request, $id)
    {
        $admin = $request->user();
        $warga = Warga::where('id', $id)->where('rt', $admin->rt)->first();

        if (!$warga) {
            return $this->sendError('Warga tidak ditemukan di RT Anda.', [], 404);
        }

        return $this->sendResponse($warga, 'Detail warga berhasil diambil.');
    }

    /**
     * Mengupdate data warga.
     */
    public function update(Request $request, $id)
    {
        $admin = $request->user();
        $warga = Warga::where('id', $id)->where('rt', $admin->rt)->first();

        if (!$warga) {
            return $this->sendError('Warga tidak ditemukan di RT Anda.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16|unique:warga,nik,'.$id,
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'status_warga' => 'required|in:tetap,kontrak,pendatang',
            'status_pernikahan' => 'required|in:belum_menikah,menikah,cerai',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->all();
        // Override RT secara paksa untuk keamanan
        $data['rt'] = $admin->rt;

        $warga->update($data);

        return $this->sendResponse($warga, 'Data warga berhasil diupdate.');
    }

    /**
     * Menghapus warga.
     */
    public function destroy(Request $request, $id)
    {
        $admin = $request->user();
        $warga = Warga::where('id', $id)->where('rt', $admin->rt)->first();

        if (!$warga) {
            return $this->sendError('Warga tidak ditemukan di RT Anda.', [], 404);
        }

        if (Schema::hasColumn('users', 'warga_id')) {
            User::where('warga_id', $id)->delete();
        } else {
            User::where('nik', $warga->nik)->delete();
        }

        $warga->delete();

        return $this->sendResponse([], 'Data warga berhasil dihapus.');
    }
}
