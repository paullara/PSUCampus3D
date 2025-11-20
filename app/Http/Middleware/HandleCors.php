<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class HandleCors
{
    public function handle(Request $request, Closure $next)
    {
        // Allow Preflight
        if ($request->getMethod() === "OPTIONS") {
            return response('')
                ->header("Access-Control-Allow-Origin", "*")
                ->header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
                ->header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
        }

        // Normal request
        $response = $next($request);

        $response->headers->set("Access-Control-Allow-Origin", "*");
        $response->headers->set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        $response->headers->set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");

        return $response;
    }
}
