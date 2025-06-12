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
        Schema::create('interaksi_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('artikel_id')->nullable()->constrained('artikels')->onDelete('cascade');
            $table->foreignId('event_id')->nullable()->constrained('events')->onDelete('cascade');
            $table->enum('tipe_interaksi', [
                'view',
                'like',
                'unlike',
                'share',
                'comment',
                'bookmark',
                'click',
                'scroll',
                'time_spent',
                'download',
                'register',
                'search'
            ]);
            $table->string('interaction_value')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('durasi_baca')->nullable();
            $table->enum('device_type', ['desktop', 'mobile', 'tablet'])->nullable();
            $table->text('user_agent')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            // Index
            $table->index(['user_id', 'tipe_interaksi']);
            $table->index(['artikel_id', 'tipe_interaksi']);
            $table->index(['event_id', 'tipe_interaksi']);
            $table->index(['created_at', 'tipe_interaksi']);
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interaksi_user');
    }
};
