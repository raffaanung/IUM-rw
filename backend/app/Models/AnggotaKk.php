<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnggotaKk extends Model
{
    protected $table = 'anggota_kk';

    protected $fillable = [
        'kartu_keluarga_id',
        'warga_id',
        'hubungan_keluarga',
    ];

    public function kartuKeluarga()
    {
        return $this->belongsTo(KartuKeluarga::class);
    }

    public function warga()
    {
        return $this->belongsTo(Warga::class);
    }
}