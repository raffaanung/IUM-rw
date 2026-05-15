<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KartuKeluarga;
use App\Models\Warga;
use App\Models\AnggotaKk;
use Illuminate\Support\Facades\Validator;

class KartuKeluargaController extends Controller
{
    /**
     * Menampilkan daftar KK di RT Admin.
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        
        $query = KartuKeluarga::with(['kepalaKeluarga:id,nama,rt,nik'])
            ->where('rt', $admin->rt)
            ->withCount('anggotaKk');

        $perPage = $request->input('limit', 10);
        $kkList = $query->paginate($perPage);

        return $this->sendPaginatedResponse($kkList, 'Daftar Kartu Keluarga berhasil diambil.');
    }

    /**
     * Membuat KK baru.
     */
    public function store(Request $request)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'no_kk' => 'required|string|unique:kartu_keluarga,no_kk',
            'warga_id' => 'required|exists:warga,id', // ID Kepala Keluarga
            'alamat' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $kepalaKeluarga = Warga::where('id', $request->warga_id)->where('rt', $admin->rt)->first();
        if (!$kepalaKeluarga) {
            return $this->sendError('Warga (Kepala Keluarga) tidak ditemukan di RT Anda.', [], 400);
        }

        $data = $request->all();
        $data['kepala_keluarga'] = $request->warga_id;
        $data['rw'] = '8'; // Default RW
        $data['rt'] = $admin->rt;

        $kk = KartuKeluarga::create($data);

        // Otomatis tambahkan Kepala Keluarga sebagai anggota pertama
        AnggotaKk::create([
            'kartu_keluarga_id' => $kk->id,
            'warga_id' => $request->warga_id,
            'hubungan_keluarga' => 'Kepala Keluarga',
        ]);

        return $this->sendResponse($kk, 'Kartu Keluarga berhasil dibuat.', 201);
    }

    /**
     * Menampilkan detail KK berserta anggotanya.
     */
    public function show(Request $request, $id)
    {
        $admin = $request->user();

        $kk = KartuKeluarga::with(['kepalaKeluarga', 'anggotaKk.warga'])
            ->where('rt', $admin->rt)
            ->where('id', $id)
            ->first();

        if (!$kk) {
            return $this->sendError('Kartu Keluarga tidak ditemukan di RT Anda.', [], 404);
        }

        return $this->sendResponse($kk, 'Detail Kartu Keluarga berhasil diambil.');
    }

    /**
     * Mengupdate data KK.
     */
    public function update(Request $request, $id)
    {
        $admin = $request->user();

        $kk = KartuKeluarga::where('rt', $admin->rt)->where('id', $id)->first();

        if (!$kk) {
            return $this->sendError('Kartu Keluarga tidak ditemukan di RT Anda.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'no_kk' => 'required|string|unique:kartu_keluarga,no_kk,'.$id,
            'alamat' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $kk->update($request->only(['no_kk', 'alamat']));

        return $this->sendResponse($kk, 'Data Kartu Keluarga berhasil diupdate.');
    }

    /**
     * Menghapus KK.
     */
    public function destroy(Request $request, $id)
    {
        $admin = $request->user();

        $kk = KartuKeluarga::where('rt', $admin->rt)->where('id', $id)->first();

        if (!$kk) {
            return $this->sendError('Kartu Keluarga tidak ditemukan di RT Anda.', [], 404);
        }

        // Opsional: Cek apakah KK masih punya anggota sebelum dihapus
        if ($kk->anggotaKk()->count() > 0) {
            return $this->sendError('Tidak dapat menghapus KK yang masih memiliki anggota.', [], 400);
        }

        $kk->delete();

        return $this->sendResponse([], 'Kartu Keluarga berhasil dihapus.');
    }

    /**
     * Menambahkan warga sebagai anggota ke dalam KK.
     */
    public function tambahAnggota(Request $request, $kkId)
    {
        $admin = $request->user();

        // 1. Pastikan KK tersebut milik RT ini
        $kk = KartuKeluarga::where('rt', $admin->rt)->where('id', $kkId)->first();

        if (!$kk) {
            return $this->sendError('Kartu Keluarga tidak valid.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'warga_id' => 'required|exists:warga,id',
            'hubungan_keluarga' => 'required|string'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        // 2. Pastikan warga yang mau ditambahkan juga berada di RT yang sama
        $warga = Warga::where('id', $request->warga_id)->where('rt', $admin->rt)->first();
        if (!$warga) {
            return $this->sendError('Warga tidak ditemukan di RT Anda.', [], 404);
        }

        // Cek apakah warga sudah ada di KK ini (mencegah duplikasi)
        $exists = AnggotaKk::where('kartu_keluarga_id', $kkId)->where('warga_id', $warga->id)->exists();
        if ($exists) {
             return $this->sendError('Warga sudah terdaftar di KK ini.', [], 400);
        }

        $anggota = AnggotaKk::create([
            'kartu_keluarga_id' => $kkId,
            'warga_id' => $warga->id,
            'hubungan_keluarga' => $request->hubungan_keluarga ?? $request->status_hubungan_dalam_keluarga
        ]);

        return $this->sendResponse($anggota, 'Anggota berhasil ditambahkan ke KK.', 201);
    }

    /**
     * Menghapus warga dari anggota KK.
     */
    public function hapusAnggota(Request $request, $kkId, $wargaId)
    {
        $admin = $request->user();

        // Pastikan KK tersebut milik RT ini
        $kk = KartuKeluarga::where('rt', $admin->rt)->where('id', $kkId)->first();

        if (!$kk) {
            return $this->sendError('Kartu Keluarga tidak valid.', [], 404);
        }

        $anggota = AnggotaKk::where('kartu_keluarga_id', $kkId)->where('warga_id', $wargaId)->first();

        if (!$anggota) {
            return $this->sendError('Anggota tidak ditemukan di KK ini.', [], 404);
        }

        $anggota->delete();

        return $this->sendResponse([], 'Anggota berhasil dihapus dari KK.');
    }

    public function updateAnggota(Request $request, $kkId, $wargaId)
    {
        $admin = $request->user();

        $kk = KartuKeluarga::where('rt', $admin->rt)->where('id', $kkId)->first();
        if (!$kk) {
            return $this->sendError('Kartu Keluarga tidak valid.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'hubungan_keluarga' => 'required|string'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $anggota = AnggotaKk::where('kartu_keluarga_id', $kkId)->where('warga_id', $wargaId)->first();
        if (!$anggota) {
            return $this->sendError('Anggota tidak ditemukan di KK ini.', [], 404);
        }

        $anggota->update([
            'hubungan_keluarga' => $request->hubungan_keluarga
        ]);

        if ($request->hubungan_keluarga === 'Kepala Keluarga') {
            AnggotaKk::where('kartu_keluarga_id', $kkId)
                ->where('hubungan_keluarga', 'Kepala Keluarga')
                ->where('warga_id', '!=', $wargaId)
                ->update(['hubungan_keluarga' => 'Anggota']);

            $kk->update(['kepala_keluarga' => $wargaId]);
        }

        return $this->sendResponse($anggota, 'Hubungan keluarga berhasil diupdate.');
    }
}
