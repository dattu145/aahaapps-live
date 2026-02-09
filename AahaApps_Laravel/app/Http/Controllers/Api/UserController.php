<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class UserController extends Controller
{
    // Register
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|unique:users,name',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => $validator->errors()], 422);
            }

            $user = User::create([
                'name' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'user' // Default to user
            ]);

            return response()->json(['message' => 'User created'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // Login
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => $validator->errors()], 422);
            }
            
            // Allow login via email or username
            $user = User::where('name', $request->username)->orWhere('email', $request->username)->first();

            // Additional check for exact input 'email' if passed separately
            if (!$user && $request->has('email')) {
                $user = User::where('email', $request->email)->first();
            }

            if (!$user) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            // Handle Node.js styled Bcrypt hashes ($2b$) by temporarily converting to PHP style ($2y$)
            $dbPassword = $user->password;
            if (strpos($dbPassword, '$2b$') === 0) {
                $dbPassword = str_replace('$2b$', '$2y$', $dbPassword);
            }

            if (!Hash::check($request->password, $dbPassword)) {
                 return response()->json(['message' => 'Invalid credentials'], 401);
            }

            // Rehash password to PHP standard if it was in Node format or needs rehash
            if (strpos($user->password, '$2b$') === 0 || Hash::needsRehash($user->password)) {
                $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
                $user->save();
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'username' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // Update Profile
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $data = $request->validate([
                'username' => 'sometimes|string|unique:users,name,' . $user->id,
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'password' => 'sometimes|string|min:6',
            ]);
            
            if ($request->has('username')) $user->name = $request->username; 
            if ($request->has('email')) $user->email = $request->email;
            if ($request->has('password')) $user->password = \Illuminate\Support\Facades\Hash::make($request->password);

            $user->save();

            return response()->json(['success' => true, 'message' => 'Profile updated successfully']);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // Send Verification OTP (Stubbed to match Node logic)
    public function sendVerificationOtp(Request $request)
    {
        // TODO: Implement actual email/SMS sending logic if needed. 
        // For now, mirroring the Node "Check Console" logic.
        $otp = rand(100000, 999999);
        \Log::info("Generated OTP for User ID {$request->user()->id}: {$otp}");
        
        // In a real app, store this in Cache or DB with expiration
        cache()->put('otp_' . $request->user()->id, $otp, 600); // 10 mins

        return response()->json(['success' => true, 'message' => 'OTP Generated (Check Logs)']);
    }
}
