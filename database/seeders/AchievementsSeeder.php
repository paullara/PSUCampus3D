<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Achievement;

class AchievementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            Achievement::create([
                'user_id' => $user->id,
                'achievements' => 'Sample achievements for' . $user->role,
                'achievement_pic' => null,
            ]);
        }
    }
}
