<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanLog extends Model
{
    protected $table = 'log_pinjam';
    protected $primaryKey = 'id_log';
    public $timestamps = false;

    protected $fillable = [
        'id_buku',
        'id_anggota',
        'tgl_pinjam',
    ];

    protected $casts = [
        'tgl_pinjam' => 'date',
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
