<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderSetting extends Model
{
    protected $table = 'reader_settings';
    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $primaryKey = 'id_anggota';

    protected $fillable = [
        'id_anggota',
        'wallpaper',
        'theme',
    ];
}
