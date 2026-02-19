<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing Google Ads settings to 'ads' group
        DB::table('settings')
            ->where('key', 'like', 'google_%')
            ->update(['group' => 'ads']);

        // Set all other settings to 'general' group
        DB::table('settings')
            ->whereNull('group')
            ->orWhere('group', '')
            ->update(['group' => 'general']);
    }

    public function down(): void
    {
        // Reset all groups to null (will use default 'general')
        DB::table('settings')->update(['group' => null]);
    }
};
