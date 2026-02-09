<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class BannerController extends Controller
{
    // Retrieve all banners
    public function index()
    {
        $banners = Banner::orderBy('created_at', 'desc')->get();
        return response()->json($banners);
    }

    // Retrieve a single banner
    public function show($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Banner not found'], 404);
        }
        return response()->json($banner);
    }

    // Create a new banner
    public function store(Request $request)
    {
        try {
            $data = $request->except(['media_items', 'media_files']);

            $media_items = [];
            
            // Handle JSON structure for manual items (like YouTube)
            if ($request->has('media_items')) {
                $val = $request->input('media_items');
                if (is_string($val)) {
                    $media_items = json_decode($val, true) ?? [];
                } elseif (is_array($val)) {
                    $media_items = $val;
                }
            }

            // Handle New Files
            if ($request->hasFile('media_files')) {
                foreach ($request->file('media_files') as $file) {
                    // Determine type based on mime BEFORE moving
                    $mime = $file->getMimeType();
                    $type = str_starts_with($mime, 'video/') ? 'video' : 'image';

                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('uploads'), $filename);

                    $media_items[] = [
                        'type' => $type,
                        'url' => 'uploads/' . $filename
                    ];
                }
            }
            $data['media_items'] = $media_items;

            $banner = Banner::create($data);
            return response()->json($banner, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Update banner
    public function update(Request $request, $id)
    {
        try {
            $banner = Banner::find($id);
            if (!$banner) {
                return response()->json(['message' => 'Banner not found'], 404);
            }

            $data = $request->except(['media_items', 'media_files']);
            
            $currentItems = $banner->media_items ?? [];
            $keptItems = [];

            if ($request->has('media_items')) {
                $val = $request->input('media_items');
                if (is_string($val)) {
                    $keptItems = json_decode($val, true) ?? [];
                } elseif (is_array($val)) {
                    $keptItems = $val;
                }
            }

            $newItems = [];
            if ($request->hasFile('media_files')) {
                foreach ($request->file('media_files') as $file) {
                    // Determine type based on mime BEFORE moving
                    $mime = $file->getMimeType();
                    $type = str_starts_with($mime, 'video/') ? 'video' : 'image';

                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('uploads'), $filename);

                    $newItems[] = [
                        'type' => $type,
                        'url' => 'uploads/' . $filename
                    ];
                }
            }

            $finalItems = array_merge($keptItems, $newItems);
            $data['media_items'] = $finalItems;

            // Cleanup deleted files
            // currentItems is array of objects ['type'=>..., 'url'=>...]
            foreach ($currentItems as $oldItem) {
                // Check if oldItem URL exists in finalItems
                $stillExists = false;
                foreach ($finalItems as $newItem) {
                    if (isset($newItem['url']) && isset($oldItem['url']) && $newItem['url'] === $oldItem['url']) {
                        $stillExists = true;
                        break;
                    }
                }

                if (!$stillExists) {
                    // Only delete if it's a local file and URL is a string
                    if (isset($oldItem['url']) && is_string($oldItem['url']) && 
                        ($oldItem['type'] ?? '') !== 'youtube') {
                        
                        $path = public_path($oldItem['url']);
                        if (File::exists($path)) {
                            File::delete($path);
                        }
                    }
                }
            }

            $banner->update($data);
            return response()->json($banner);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Delete banner
    public function destroy($id)
    {
        $banner = Banner::find($id);
        if (!$banner) {
            return response()->json(['message' => 'Banner not found'], 404);
        }

        if (!empty($banner->media_items)) {
            foreach ($banner->media_items as $item) {
                // Check if item has a URL and is not a youtube link (external)
                if (isset($item['url']) && is_string($item['url']) && ($item['type'] ?? '') !== 'youtube') {
                    $path = public_path($item['url']);
                    if (File::exists($path)) {
                        File::delete($path);
                    }
                }
            }
        }

        $banner->delete();
        return response()->noContent();
    }
}
