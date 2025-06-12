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
        Schema::create('artikels', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 500);
            $table->string('slug', 500)->unique();
            $table->longText('content');
            $table->text('excerpt')->nullable();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('kategori_id')->constrained('kategori_artikels')->onDelete('cascade');
            $table->enum('status', ['draft', 'review', 'published', 'archived'])->default('draft');
            $table->string('featured_image_url')->nullable();
            $table->json('gallery_urls')->nullable();
            $table->json('tags')->nullable();
            $table->text('meta_description')->nullable();
            $table->integer('reading_time')->default(0);
            $table->integer('jumlah_view')->default(0);
            $table->integer('jumlah_like')->default(0);
            $table->integer('jumlah_share')->default(0);
            $table->datetime('tanggal_publikasi')->nullable();
            $table->datetime('tanggal_jadwal_publikasi')->nullable();

            // Kolom untuk machine learning
            $table->string('ml_category_prediction', 100)->nullable();
            $table->decimal('ml_confidence_score', 3, 2)->nullable();
            $table->text('content_vector')->nullable();
            $table->decimal('sentiment_score', 3, 2)->nullable();
            $table->decimal('readability_score', 3, 2)->nullable();
            $table->json('keywords_extracted')->nullable();
            $table->json('event_terkait')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes untuk performa query
            $table->index(['status', 'tanggal_publikasi']);
            $table->index(['reporter_id', 'status']);
            $table->index(['kategori_id', 'status']);
            $table->index('slug');
            $table->index('tanggal_publikasi');
            $table->fullText(['judul', 'content']); // Full-text search
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artikels');
    }
};
