<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplyOfficeController extends Controller
{
    public function announcement()
    {
        return Inertia::render('Education/Announcement');
    }

    public function services()
    {
        return Inertia::render('Education/ServicesPosting');
    }

}
