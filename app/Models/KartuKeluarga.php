<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KartuKeluarga extends Model
{
    protected $table = 'kartu_keluarga';

    protected $fillable = [
        'no_kk',
        'kepala_keluarga',
        'alamat',
        'rt',
        'rw',
    ];

    public function anggotaKk()
    {
        return $this->hasMany(AnggotaKk::class);
    }

    public function warga()
    {
        return $this->belongsToMany(Warga::class, 'anggota_kk')
                    ->withPivot('hubungan_keluarga')
                    ->withTimestamps();
    }
}