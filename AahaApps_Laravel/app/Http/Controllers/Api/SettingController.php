<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SettingController extends Controller
{
    // Retrieve all settings
    public function index()
    {
        $settings = Setting::all();
        // Convert to key-value pairs
        $settingsObj = [];
        foreach ($settings as $setting) {
            $settingsObj[$setting->key] = $setting->value;
        }
        return response()->json($settingsObj);
    }

    // Update or Create a single setting
    public function update(Request $request)
    {
        try {
            $key = $request->input('key');
            $value = $request->input('value');

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $value = 'uploads/' . $filename;
            }

            $setting = Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );

            return response()->json($setting);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Bulk update settings
    public function updateBulk(Request $request)
    {
        try {
            $settings = $request->all(); // Expecting { key: value, key2: value2 }

            foreach ($settings as $key => $value) {
                // Skip internal request keys if any (like _token)
                if (in_array($key, ['_token', '_method'])) continue;

                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            return response()->json(['message' => 'Settings updated']);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
