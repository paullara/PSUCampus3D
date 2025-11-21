<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Happening;

class HappeningsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            Happening::create([
                'user_id' => $user->id,
                'picture' => null,
                'video' => null,
                'happenings' => 'Sample event for ' . $user->role,
            ]);
        }
    }
}
