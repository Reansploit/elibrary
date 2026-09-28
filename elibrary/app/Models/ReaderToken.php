<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderToken extends Model
{
    protected $table = 'reader_tokens';
    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_anggota',
        'token_hash',
    ];
}
