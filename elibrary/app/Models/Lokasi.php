<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lokasi extends Model
{
    protected $table = 'tb_lokasi';
    protected $primaryKey = 'id_lokasi';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_lokasi',
        'nama',
        'keterangan',
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'lokasi', 'id_lokasi');
    }
}
