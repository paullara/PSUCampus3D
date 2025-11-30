<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PASOController extends Controller
{
    public function announcement()
    {
        return Inertia::render('PASO/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('PASO/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('PASO/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('PASO/HapppeningPosting');
    }
}
