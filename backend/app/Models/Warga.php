<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warga extends Model
{
    protected $table = 'warga';

    protected $fillable = [
        'nik',
        'nama',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'rt',
        'rw',
        'status_warga',
        'status_pernikahan',
        'pekerjaan',
        'no_hp',
        'foto',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function anggotaKk()
    {
        return $this->hasMany(AnggotaKk::class);
    }

    public function kartuKeluarga()
    {
        return $this->belongsToMany(KartuKeluarga::class, 'anggota_kk')
                    ->withPivot('hubungan_keluarga')
                    ->withTimestamps();
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }
}