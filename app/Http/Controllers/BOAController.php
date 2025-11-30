<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BOAController extends Controller
{ 
    public function services()
    {
        return Inertia::render('BOA/ServicesPosting');
    }

    public function achievements()
    {
        return Inertia::render('BOA/AchievementPosting');
    }

    public function announcement()
    {
        return Inertia::render('BOA/Announcement');
    }

    public function happenings()
    {
        return Inertia::render('BOA/HappeningPosting');
    }
}
