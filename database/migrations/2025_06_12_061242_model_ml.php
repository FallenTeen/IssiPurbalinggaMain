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
        Schema::create('model_mls', function (Blueprint $table) {
            $table->id();
            $table->string('nama_model', 100);
            $table->enum('tipe_model', [
                'classification',
                'regression',
                'clustering',
                'recommendation',
                'sentiment_analysis',
                'text_analysis',
                'content_similarity'
            ]);
            $table->string('versi', 20);
            $table->text('deskripsi')->nullable();
            $table->string('model_path')->nullable(); // Path ke file model
            $table->json('model_parameters')->nullable(); // Parameter model
            $table->json('training_data_info')->nullable(); // Info data training
            $table->decimal('accuracy_score', 5, 4)->nullable();
            $table->decimal('precision_score', 5, 4)->nullable();
            $table->decimal('recall_score', 5, 4)->nullable();
            $table->decimal('f1_score', 5, 4)->nullable();
            $table->enum('status', ['training', 'ready', 'deprecated', 'error'])->default('training');
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('last_trained_at')->nullable();
            $table->integer('training_samples')->nullable(); // Jumlah data training
            $table->integer('validation_samples')->nullable(); // Jumlah data validation
            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index(['nama_model', 'versi']);
            $table->index(['tipe_model', 'is_active']);
            $table->index('status');
            $table->index('created_by');
            $table->unique(['nama_model', 'versi'], 'unique_model_version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_mls');
    }
};
