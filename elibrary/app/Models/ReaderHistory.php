<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderHistory extends Model
{
    protected $table = 'reader_history';
    public $timestamps = false;
    const UPDATED_AT = null;

    protected $fillable = [
        'id_anggota',
        'id_buku',
        'aksi',
    ];
}
