<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HMOController extends Controller
{
    public function announcement()
    {
        return Inertia::render('HMO/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('HMO/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('HMO/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('HMO/HappeningPosting');
    }
}
