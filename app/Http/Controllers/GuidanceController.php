<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
class GuidanceController extends Controller
{
    public function announcement()
    {
        return Inertia::render('Guidance/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('Guidance/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('Guidance/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('Guidance/HapppeningPosting');
    }
}
