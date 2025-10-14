<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function informationTechnology()
    {
        return Inertia::render('InformationTechnology/Dashboard');
    }

    public function artsAndScience()
    {
        return Inertia::render('Arts_Science/Dashboard');
    }
}