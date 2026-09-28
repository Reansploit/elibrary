<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderList extends Model
{
    protected $table = 'reader_lists';
    public $timestamps = true;

    protected $fillable = [
        'id_anggota',
        'name',
    ];
}
