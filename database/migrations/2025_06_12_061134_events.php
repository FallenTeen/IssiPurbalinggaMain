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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->enum('type', ['downhill', 'roadbike', 'unsupported']);
            $table->enum('kategori', ['amatir', 'professional', 'junior', 'senior']);
            $table->datetime('tanggal_mulai');
            $table->datetime('tanggal_selesai');
            $table->string('lokasi');
            $table->text('deskripsi');
            $table->integer('max_participants')->default(100);
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->enum('difficulty_level', ['easy', 'medium', 'hard', 'expert']);
            $table->json('requirements')->nullable();
            $table->boolean('weather_dependency')->default(false);
            $table->enum('terrain_type', ['road', 'mountain', 'mixed']);
            $table->integer('elevation_gain')->default(0);
            $table->decimal('jarak_km', 5, 2)->nullable();
            $table->enum('status', ['draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'])->default('draft');
            $table->string('banner_image_url')->nullable();
            $table->json('gallery_urls')->nullable();
            $table->json('event_features')->nullable(); // untuk machine learning
            $table->decimal('popularity_score', 3, 2)->default(0);
            $table->decimal('success_rate', 3, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes untuk performa query
            $table->index(['status', 'tanggal_mulai']);
            $table->index(['type', 'kategori']);
            $table->index('slug');
            $table->index('tanggal_mulai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
