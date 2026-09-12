<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('tb_reservasi')) {
            Schema::create('tb_reservasi', function (Blueprint $table) {
                $table->id();
                $table->string('id_buku', 10);
                $table->string('id_anggota', 50);
                $table->enum('status', ['antre', 'siap', 'selesai', 'batal'])->default('antre');
                $table->timestamps();

                $table->foreign('id_buku')
                    ->references('id_buku')
                    ->on('tb_buku')
                    ->onUpdate('cascade')
                    ->onDelete('cascade');
                $table->foreign('id_anggota')
                    ->references('id_anggota')
                    ->on('tb_anggota')
                    ->onUpdate('cascade')
                    ->onDelete('cascade');
            });
        }

        // Permission untuk fitur reservasi (ikut seeded ke Administrator).
        foreach (['view_reservations', 'manage_reservations'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $admin = Role::where('name', 'Administrator')->first();
        if ($admin) {
            $admin->givePermissionTo(['view_reservations', 'manage_reservations']);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Permission::whereIn('name', ['view_reservations', 'manage_reservations'])->delete();

        Schema::dropIfExists('tb_reservasi');
    }
};
