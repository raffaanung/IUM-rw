<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use Illuminate\Http\Request;

use App\Models\Warga;
use App\Models\AnggotaKk;
use Illuminate\Support\Facades\Validator;

class KartuKeluargaController extends Controller
{
    // semua KK se-RW
    public function index(Request $request)
    {
        $query = KartuKeluarga::with(['kepalaKeluarga:id,nama,rt,nik'])->withCount('anggotaKk');

        if ($request->filled('rt')) {
            $query->where('rt', $request->rt);
        }

        $kk = $query
            ->orderBy('rt')
            ->paginate(10);

        return $this->sendResponse(
            $kk,
            'Data kartu keluarga berhasil diambil.'
        );
    }

    // detail KK
    public function show($id)
    {
        $kk = KartuKeluarga::with(['kepalaKeluarga', 'anggotaKk.warga'])->findOrFail($id);

        return $this->sendResponse(
            $kk,
            'Detail kartu keluarga berhasil diambil.'
        );
    }

    // Tambah KK
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'no_kk' => 'required|string|size:16|unique:kartu_keluarga,no_kk',
            'warga_id' => 'required|exists:warga,id', // ID Kepala Keluarga
            'alamat' => 'required|string',
            'rt' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $kepalaKeluarga = Warga::where('id', $request->warga_id)->where('rt', $request->rt)->first();
        if (!$kepalaKeluarga) {
            return $this->sendError('Warga (Kepala Keluarga) tidak ditemukan di RT yang ditentukan.', [], 400);
        }

        $data = $request->all();
        $data['kepala_keluarga'] = $request->warga_id;
        $data['rw'] = '8'; 

        $kk = KartuKeluarga::create($data);

        // Otomatis tambahkan Kepala Keluarga sebagai anggota pertama
        AnggotaKk::create([
            'kartu_keluarga_id' => $kk->id,
            'warga_id' => $request->warga_id,
            'hubungan_keluarga' => 'Kepala Keluarga',
        ]);

        return $this->sendResponse($kk, 'Kartu Keluarga berhasil dibuat.', 201);
    }

    // Update KK
    public function update(Request $request, $id)
    {
        $kk = KartuKeluarga::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'no_kk' => 'required|string|size:16|unique:kartu_keluarga,no_kk,'.$id,
            'warga_id' => 'required|exists:warga,id',
            'alamat' => 'required|string',
            'rt' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->all();
        $data['kepala_keluarga'] = $request->warga_id;
        
        $kk->update($data);

        return $this->sendResponse($kk, 'Data kartu keluarga berhasil diperbarui.');
    }

    // Hapus KK
    public function destroy($id)
    {
        $kk = KartuKeluarga::findOrFail($id);
        $kk->delete();

        return $this->sendResponse([], 'Kartu keluarga berhasil dihapus.');
    }

    public function tambahAnggota(Request $request, $kkId)
    {
        $kk = KartuKeluarga::findOrFail($kkId);

        $validator = Validator::make($request->all(), [
            'warga_id' => 'required|exists:warga,id',
            'hubungan_keluarga' => 'required|string'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        // Pastikan warga yang mau ditambahkan berada di RT yang sama dengan KK
        $warga = Warga::where('id', $request->warga_id)->where('rt', $kk->rt)->first();
        if (!$warga) {
            return $this->sendError('Warga tidak ditemukan di RT yang sama dengan Kartu Keluarga.', [], 400);
        }

        // Cek apakah warga sudah ada di KK ini
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

    public function updateAnggota(Request $request, $kkId, $wargaId)
    {
        $kk = KartuKeluarga::findOrFail($kkId);

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

    public function hapusAnggota(Request $request, $kkId, $wargaId)
    {
        $kk = KartuKeluarga::findOrFail($kkId);
        $anggota = AnggotaKk::where('kartu_keluarga_id', $kkId)->where('warga_id', $wargaId)->first();

        if (!$anggota) {
            return $this->sendError('Anggota tidak ditemukan di KK ini.', [], 404);
        }

        $anggota->delete();

        return $this->sendResponse([], 'Anggota berhasil dihapus dari KK.');
    }
}
