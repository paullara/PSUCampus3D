<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function services()
    {
        return Inertia::render('Cashier/ServicesPosting');
    }

    public function announcement()
    {
        return Inertia::render('Cashier/Announcement');
    }
}
