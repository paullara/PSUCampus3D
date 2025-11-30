<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CEDController extends Controller
{
    public function achievements()
    {
        return Inertia::render('CED/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('CED/ServicesPosting');
    }

    public function announcement()
    {
        return Inertia::render('CED/Announcement');
    }

    public function happenings()
    {
        return Inertia::render('CED/HappeningPosting');
    }
}
