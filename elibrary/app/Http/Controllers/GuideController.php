<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class GuideController extends Controller
{
    /**
     * Halaman panduan — terbuka untuk semua user yang login.
     */
    public function index()
    {
        return Inertia::render('Panduan/Index');
    }
}
