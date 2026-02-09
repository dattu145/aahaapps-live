<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('circular_items')) {
            Schema::create('circular_items', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->json('section1_images')->nullable();
                $table->string('section2_image')->nullable();
                $table->string('section2_video')->nullable();
                $table->json('video_options')->nullable();
                $table->json('buttons')->nullable();
                $table->string('enquiry_link')->nullable();
                $table->string('link')->nullable(); // Legacy support or redundant
                $table->string('card_bg_color')->nullable();
                $table->string('title_color')->nullable();
                $table->string('desc_color')->nullable();
                $table->integer('section1_image_width')->nullable();
                $table->integer('section1_image_height')->nullable();
                $table->boolean('is_active')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('circular_items');
    }
};
