<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = ['device_id', 'kind', 'message', 'handled'];

    protected function casts(): array
    {
        return ['handled' => 'boolean'];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function label(): string
    {
        return match ($this->kind) {
            'unexpected_close' => 'Tutup tak wajar',
            'foreign_app' => 'App lain terbuka',
            'offline_gap' => 'Sempat offline',
            default => $this->kind,
        };
    }
}
