<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $fillable = [
        'judul',
        'keterangan',
        'jumlah',
        'jenis',
        'kategori',
        'rt',
        'tanggal',
        'pencatat',
        'created_by',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
