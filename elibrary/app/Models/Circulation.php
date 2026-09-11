<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Circulation extends Model
{
    protected $table = 'tb_sirkulasi';
    protected $primaryKey = 'id_sk';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_sk',
        'id_buku',
        'id_anggota',
        'tgl_pinjam',
        'tgl_kembali',
        'status',
    ];

    protected $casts = [
        'tgl_pinjam' => 'date',
        'tgl_kembali' => 'date',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'id_buku', 'id_buku');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'id_anggota', 'id_anggota');
    }
}
