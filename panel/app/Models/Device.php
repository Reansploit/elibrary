<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    protected $fillable = [
        'mac', 'hostname', 'custom_name', 'ip', 'token_hash',
        'agent_version', 'app_open', 'app_expected', 'active_title', 'open_apps', 'last_foreign_title',
        'closed_beats', 'foreign_beats', 'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'app_open' => 'boolean',
            'app_expected' => 'boolean',
            'last_seen_at' => 'datetime',
            'open_apps' => 'array',
        ];
    }

    public function commands(): HasMany
    {
        return $this->hasMany(DeviceCommand::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(DeviceLog::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * Aplikasi wajib khusus PC ini. Kosong = ikut semua global.
     */
    public function managedApps(): BelongsToMany
    {
        return $this->belongsToMany(ManagedApp::class, 'device_managed_app');
    }

    /**
     * Daftar kelolaan efektif: assign khusus bila ada, else global.
     */
    public function effectiveApps()
    {
        return $this->managedApps()->exists()
            ? $this->managedApps()->orderBy('name')->get()
            : ManagedApp::orderBy('name')->get();
    }

    public function displayName(): string
    {
        return $this->custom_name ?: $this->hostname;
    }

    public function isOnline(int $seconds = 180): bool
    {
        return $this->last_seen_at && $this->last_seen_at->gt(now()->subSeconds($seconds));
    }

    public function log(string $kind, ?string $detail = null): void
    {
        $this->logs()->create(['kind' => $kind, 'detail' => $detail]);
    }

    public function raiseAlert(string $kind, string $message): void
    {
        $exists = $this->alerts()
            ->where('kind', $kind)
            ->where('handled', false)
            ->exists();
        if (! $exists) {
            $this->alerts()->create(['kind' => $kind, 'message' => $message]);
        }
    }
}
