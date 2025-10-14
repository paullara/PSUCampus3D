<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\InfoBuilding;

class InfoBuildingsTableSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            InfoBuilding::create([
                'user_id' => $user->id,
                'name' => ucfirst(str_replace('_', ' ', $user->role)) . ' Building',
                'information' => 'Information for ' . $user->role . ' building.',
                'picture' => null,
                'video' => null,
                'happenings' => 'Sample event for ' . $user->role,
            ]);
        }
    }
}