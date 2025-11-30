<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MISController extends Controller
{
    public function announcement()
    {
        return Inertia::render('Education/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('Education/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('Education/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('Education/HapppeningPosting');
    }
}
