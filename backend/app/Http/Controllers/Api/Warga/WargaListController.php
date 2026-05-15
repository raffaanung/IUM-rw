<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warga;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class WargaListController extends Controller
{
    /**
     * Menampilkan list warga di dalam lingkungan RT yang sama (Read Only)
     * Lengkap dengan search, filter status, pagination, dan Sensor NIK.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Ambil data profil warga milik user yang sedang login
        $profilWarga = null;
        if (Schema::hasColumn('users', 'warga_id') && $user->warga_id) {
            $profilWarga = Warga::where('id', $user->warga_id)->first();
        }
        if (!$profilWarga && $user->nik) {
            $profilWarga = Warga::where('nik', $user->nik)->first();
        }

        if (!$profilWarga) {
            return $this->sendError('Profil warga tidak ditemukan atau data belum lengkap.', [], 400);
        }

        // Query dasar: Ambil data warga yang satu RT dan RW dengan user login
        $query = Warga::where('rt', $profilWarga->rt)->where('rw', $profilWarga->rw);

        // Filter: Search berdasarkan Nama atau NIK
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('nik', 'LIKE', '%' . $searchTerm . '%');
            });
        }

        // Filter: Status Kependudukan / Status Warga (disesuaikan dengan field di DB Anda)
        if ($request->filled('status_warga')) {
            $query->where('status_warga', $request->status_warga);
        }

        // Pagination: default 10 baris per halaman
        $perPage = $request->input('limit', 10);
        
        // Sorting default: Nama Ascending (A-Z)
        $wargaList = $query->orderBy('nama', 'asc')->paginate($perPage);

        // Memanipulasi hasil untuk menyensor NIK demi privasi (Point No 2)
        $wargaList->getCollection()->transform(function ($item) {
            
            // Logika Sensor NIK: Sisakan 6 digit awal dan 4 digit akhir
            $maskedNik = $item->nik;
            if ($maskedNik && strlen($maskedNik) >= 16) {
                $maskedNik = substr($maskedNik, 0, 6) . '******' . substr($maskedNik, -4);
            } elseif ($maskedNik) {
                // Fallback jika NIK kurang dari 16 digit namun ada isinya
                $maskedNik = substr($maskedNik, 0, 4) . '***' . substr($maskedNik, -2);
            }

            $isSelf = false;
            if (Schema::hasColumn('users', 'warga_id') && request()->user() && request()->user()->warga_id) {
                $isSelf = (int) $item->id === (int) request()->user()->warga_id;
            } elseif (request()->user() && request()->user()->nik) {
                $isSelf = $item->nik === request()->user()->nik;
            }

            return [
                'id'            => $item->id,
                'nik'           => $isSelf ? $item->nik : $maskedNik,
                'nama'          => $item->nama,
                'jenis_kelamin' => $item->jenis_kelamin,
                'alamat'        => $item->alamat,
                'rt'            => $item->rt,
                'rw'            => $item->rw,
                'status_warga'  => $item->status_warga,
                'status_pernikahan' => $isSelf ? $item->status_pernikahan : null,
                'tempat_lahir'  => $isSelf ? $item->tempat_lahir : null,
                'tanggal_lahir' => $isSelf ? $item->tanggal_lahir : null,
                'pekerjaan'     => $isSelf ? $item->pekerjaan : null,
                'pendidikan'    => $isSelf ? $item->pendidikan : null,
                'pendapatan'    => $isSelf ? $item->pendapatan : null,
                'no_hp'         => $isSelf ? $item->no_hp : null,
            ];
        });

        return $this->sendPaginatedResponse($wargaList, 'Data warga berhasil diambil.');
    }

    /**
     * Menampilkan Detail spesifik 1 Warga (Point No 1)
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $profilWarga = null;
        if (Schema::hasColumn('users', 'warga_id') && $user->warga_id) {
            $profilWarga = Warga::where('id', $user->warga_id)->first();
        }
        if (!$profilWarga && $user->nik) {
            $profilWarga = Warga::where('nik', $user->nik)->first();
        }

        if (!$profilWarga) {
            return $this->sendError('Profil warga tidak ditemukan.', [], 400);
        }

        // Cari data warga berdasarkan ID, dan pastikan dia masih berada di RT/RW yang sama
        $detail = Warga::with(['kartuKeluarga', 'anggotaKk'])
                       ->where('id', $id)
                       ->where('rt', $profilWarga->rt)
                       ->where('rw', $profilWarga->rw)
                       ->first();

        // Jika data tidak ditemukan (entah ID salah, atau warga tersebut beda RT)
        if (!$detail) {
            return $this->sendError('Data warga tidak ditemukan atau berada di luar lingkungan RT Anda.', [], 404);
        }

        // Untuk detail, NIK bisa ditampilkan utuh atau disensor, tergantung kebijakan RT Anda.
        // Di sini kita tampilkan utuh karena ini adalah halaman detail (sudah spesifik).
        
        return $this->sendResponse($detail, 'Detail profil warga berhasil diambil.');
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $profilWarga = null;
        if (Schema::hasColumn('users', 'warga_id') && $user->warga_id) {
            $profilWarga = Warga::where('id', $user->warga_id)->first();
        }
        if (!$profilWarga && $user->nik) {
            $profilWarga = Warga::where('nik', $user->nik)->first();
        }

        if (!$profilWarga) {
            return $this->sendError('Profil warga tidak ditemukan.', [], 400);
        }

        if ((int) $profilWarga->id !== (int) $id) {
            return $this->sendError('Anda hanya dapat mengedit profil Anda sendiri.', [], 403);
        }

        $validator = Validator::make($request->all(), [
            'alamat' => 'sometimes|required|string',
            'pekerjaan' => 'nullable|string',
            'pendidikan' => 'nullable|string',
            'pendapatan' => 'nullable|numeric|min:0',
            'no_hp' => 'nullable|string',
            'foto' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $profilWarga->update($request->only([
            'alamat',
            'pekerjaan',
            'pendidikan',
            'pendapatan',
            'no_hp',
            'foto',
        ]));

        return $this->sendResponse($profilWarga, 'Profil berhasil diperbarui.');
    }
}
