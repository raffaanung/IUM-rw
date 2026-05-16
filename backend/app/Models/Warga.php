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
        'rt',
        'rw',
        'status_warga',
        'status_pernikahan',
        'pekerjaan',
        'pendidikan',
        'pendapatan',
        'agama',
        'alamat_ktp',
        'alamat_sekarang',
        'no_hp',
        'foto',
    ];

    protected $appends = [
        'jenisKelamin',
        'statusKependudukan',
        'statusPerkawinan',
        'tempatLahir',
        'tanggalLahirFormatted',
        'pendidikan',
        'pendapatan',
        'noTelepon',
        'noKK',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
    ];

    public function getJenisKelaminAttribute()
    {
        $val = $this->attributes['jenis_kelamin'] ?? null;
        return $val === 'L' ? 'Laki-laki' : 'Perempuan';
    }

    public function getStatusKependudukanAttribute()
    {
        $val = $this->attributes['status_warga'] ?? '';
        return ucfirst($val);
    }

    public function getStatusPerkawinanAttribute()
    {
        $val = $this->attributes['status_pernikahan'] ?? '';
        return str_replace('_', ' ', ucfirst($val));
    }

    public function getTempatLahirAttribute()
    {
        return $this->attributes['tempat_lahir'] ?? '';
    }

    public function getTanggalLahirFormattedAttribute()
    {
        return isset($this->attributes['tanggal_lahir']) ? $this->tanggal_lahir->format('Y-m-d') : '';
    }

    public function getNoTeleponAttribute()
    {
        return $this->attributes['no_hp'] ?? '';
    }

    public function getPendidikanAttribute()
    {
        return $this->attributes['pendidikan'] ?? '';
    }

    public function getPendapatanAttribute()
    {
        return (float) ($this->attributes['pendapatan'] ?? 0);
    }

    public function getNoKKAttribute()
    {
        // Get NO KK from the first KK this warga belongs to
        $kk = $this->kartuKeluarga()->first();
        return $kk ? $kk->no_kk : 'Belum Ada';
    }

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