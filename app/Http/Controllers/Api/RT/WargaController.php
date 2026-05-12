<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warga;
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
            'nik' => 'required|string|unique:warga,nik',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
            'status_warga' => 'required|string',
            // ... tambahkan validasi lain sesuai kebutuhan
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->all();
        // Override RT secara paksa untuk keamanan (Ownership)
        $data['rt'] = $admin->rt; 
        
        $warga = Warga::create($data);

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
            'nik' => 'required|string|unique:warga,nik,'.$id,
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
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

        $warga->delete();

        return $this->sendResponse([], 'Data warga berhasil dihapus.');
    }
}