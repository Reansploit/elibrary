<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceLog extends Model
{
    protected $fillable = ['device_id', 'kind', 'detail'];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function label(): string
    {
        return match ($this->kind) {
            'enrolled' => 'Terdaftar',
            'online' => 'Kembali online',
            'app_opened' => 'App dibuka',
            'app_closed' => 'App ditutup',
            'foreign_window' => 'Window lain',
            'renamed' => 'Diganti nama',
            'command' => 'Perintah',
            default => $this->kind,
        };
    }
}
