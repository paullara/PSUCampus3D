<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ITDeptController extends Controller
{
    public function achievements()
    {
        return Inertia::render('IT/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('IT/ServicesPosting');
    }

    public function announcement()
    {
        return Inertia::render('IT/Announcement');
    }

    public function happenings()
    {
        return Inertia::render('IT/HappeningPosting');
    }
}
