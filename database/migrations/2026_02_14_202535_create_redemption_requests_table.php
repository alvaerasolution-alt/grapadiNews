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
        Schema::create('redemption_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('redemption_item_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('point_cost');
            $table->unsignedInteger('rupiah_value');
            $table->string('payment_method');
            // Bank transfer fields
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();
            // E-wallet fields
            $table->string('ewallet_provider')->nullable();
            $table->string('ewallet_number')->nullable();
            $table->string('ewallet_name')->nullable();
            // Status & admin
            $table->string('status')->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('redemption_requests');
    }
};
