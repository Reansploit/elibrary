<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderSave extends Model
{
    protected $table = 'reader_saves';

    protected $fillable = [
        'id_anggota',
        'id_buku',
    ];
}
