<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../PSUCampus3D/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Composer autoloader
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';


// Handle request
$app->handleRequest(Request::capture());
