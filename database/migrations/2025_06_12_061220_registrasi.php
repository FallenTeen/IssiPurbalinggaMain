<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registrasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->string('kode_registrasi', 20)->unique();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->enum('status_pembayaran', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->string('metode_pembayaran', 50)->nullable();
            $table->string('bukti_pembayaran')->nullable();
            $table->json('data_registrasi')->nullable();
            $table->json('kontak_darurat')->nullable();
            $table->json('kondisi_medis')->nullable();
            $table->enum('pengalaman', ['pemula', 'menengah', 'mahir', 'expert'])->default('pemula');
            $table->json('spesifikasi_sepeda')->nullable();
            $table->string('nama_tim', 100)->nullable();
            $table->decimal('biaya_pendaftaran', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('diterima_pada')->nullable();
            $table->timestamp('ditolak_pada')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index(['event_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('kode_registrasi');
            $table->index('status_pembayaran');
            $table->unique(['user_id', 'event_id'], 'unique_user_event');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrasis');
    }
};
