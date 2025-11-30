<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SSOController extends Controller
{
    public function announcement()
    {
        return Inertia::render('SSO/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('SSO/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('SSO/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('SSO/HapppeningPosting');
    }
}
