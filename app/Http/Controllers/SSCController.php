<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SSCController extends Controller
{
    public function announcement()
    {
        return Inertia::render('SSC/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('SSC/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('SSC/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('SSC/HapppeningPosting');
    }
}
