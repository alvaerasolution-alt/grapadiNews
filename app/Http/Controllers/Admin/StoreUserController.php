<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StoreUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => ['admin', 'editor', 'contributor'],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $password = $validated['password'] ?? Str::random(12);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
        ]);

        $user->assignRole($validated['role']);

        $message = 'User created successfully';
        if (empty($validated['password'])) {
            $message .= ". Temporary password: {$password}";
        }

        return redirect()->route('admin.users.index')
            ->with('success', $message);
    }
}
