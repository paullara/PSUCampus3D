<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountingController extends Controller
{
    public function happenings()
    {
        return Inertia::render('Accounting/HappeningPosting');
    }

    public function services()
    {
        return Inertia::render('Accounting/ServicesPosting');
    }

    public function achievements()
    {
        return Inertia::render('Accounting/AchievementPosting');
    }
}
