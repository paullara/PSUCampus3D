<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\InfoBuilding;
use Inertia\Inertia;

class AdministrativeController extends Controller
{
    public function happenings()
    {
        return Inertia::render('Administrative/HappeningPosting');
    }

    public function services()
    {
        return Inertia::render('Administrative/ServicesPosting');
    }

    public function achievements()
    {
        return Inertia::render('Administrative/AchievementPosting');
    }

    public function postInfoBldg()
    {
        $users = User::all();

        return Inertia::render('Administrative/PostInfoBldg', [
            'users' => $users
        ]);
    }

    public function BuildingInfo()
    {
        $infoBuilding = InfoBuilding::all();

        return Inertia::render('Administrative/BuildingInfo', [
            'infoBuilding' => $infoBuilding,
        ]);
    }

    public function announcement()
    {
        return Inertia::render('Administrative/Announcement');
    }
    
}
