<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'post_id']);
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->string('session_id', 100)->after('id');
            $table->unique(['session_id', 'post_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropUnique(['session_id', 'post_id']);
            $table->dropColumn('session_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unique(['user_id', 'post_id']);
        });
    }
};
