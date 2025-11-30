<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class COAController extends Controller
{
    public function achievements()
    {
        return Inertia::render('COA/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('COA/ServicesPosting');
    }

    public function announcement()
    {
        return Inertia::render('COA/Announcement');
    }

    public function happenings()
    {
        return Inertia::render('COA/HappeningPosting');
    }
}
