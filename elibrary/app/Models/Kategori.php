<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = 'tb_kategori';
    protected $primaryKey = 'id_kategori';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_kategori',
        'nama',
        'keterangan',
    ];

    public function books()
    {
        return $this->hasMany(Book::class, 'kategori', 'id_kategori');
    }
}
