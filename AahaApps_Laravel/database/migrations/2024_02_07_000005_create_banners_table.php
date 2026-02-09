<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->json('media_items')->nullable();
                $table->integer('speed')->default(10);
                $table->string('placement')->default('top');
            
                // Foreign key to circular_items (cards)
                // Using unsignedBigInteger explicitly or foreignId
                // If target_card_id refers to circular_items.id
                $table->unsignedBigInteger('target_card_id')->nullable();
            
                $table->string('relative_position')->nullable(); // 'before', 'after'
                $table->integer('height')->default(400);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                // Optional: Foreign key constraint if desired
                // $table->foreign('target_card_id')->references('id')->on('circular_items')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
