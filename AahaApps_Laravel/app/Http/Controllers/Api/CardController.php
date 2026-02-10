<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class CardController extends Controller
{
    // Retrieve all cards
    public function index()
    {
        $cards = Card::orderBy('sort_order', 'asc')->get();
        return response()->json($cards);
    }

    // Retrieve a single card
    public function show($id)
    {
        $card = Card::find($id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }
        return response()->json($card);
    }

    // Create a new card
    public function store(Request $request)
    {
        try {
            $data = $request->all();

            // Handle File Uploads
            if ($request->hasFile('section1_images')) {
                $section1_images = [];
                foreach ($request->file('section1_images') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('uploads'), $filename);
                    $section1_images[] = 'uploads/' . $filename;
                }
                $data['section1_images'] = $section1_images;
            }

            if ($request->hasFile('section2_image')) {
                $file = $request->file('section2_image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $data['section2_image'] = 'uploads/' . $filename;
            }

            if ($request->hasFile('section2_video')) {
                $file = $request->file('section2_video');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $data['section2_video'] = 'uploads/' . $filename;
            }

            // Handle JSON fields embedded in multipart forms
            if (isset($data['buttons']) && is_string($data['buttons'])) {
                $data['buttons'] = json_decode($data['buttons'], true);
            }
            if (isset($data['video_options']) && is_string($data['video_options'])) {
                $data['video_options'] = json_decode($data['video_options'], true);
            }

            // Fallback assignments from MERN logic if needed
            if (!isset($data['enquiry_link']) && isset($data['link'])) {
                $data['enquiry_link'] = $data['link'];
            }
            if (!isset($data['link']) && isset($data['enquiry_link'])) {
                $data['link'] = $data['enquiry_link'];
            }
            if (!isset($data['link'])) {
                 $data['link'] = ''; // Prevent 1364 error if DB is strict
            }
            
            // Map legacy fields if present
            if (isset($data['thumbnail_width'])) $data['section1_image_width'] = $data['thumbnail_width'];
            if (isset($data['thumbnail_height'])) $data['section1_image_height'] = $data['thumbnail_height'];

            $card = Card::create($data);

            return response()->json($card, 201);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Update an existing card
    public function update(Request $request, $id)
    {
        try {
            $card = Card::find($id);
            if (!$card) {
                return response()->json(['message' => 'Card not found'], 404);
            }

            $data = $request->except(['section1_images']); // Handle deeply manually
            
            // 1. Handle Section 2 Image
            if ($request->hasFile('section2_image')) {
                // Delete old
                if ($card->section2_image && File::exists(public_path($card->section2_image))) {
                    File::delete(public_path($card->section2_image));
                }
                $file = $request->file('section2_image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $data['section2_image'] = 'uploads/' . $filename;
            } elseif ($request->input('section2_image') === 'DELETE') {
                if ($card->section2_image && File::exists(public_path($card->section2_image))) {
                    File::delete(public_path($card->section2_image));
                }
                $data['section2_image'] = null;
            }

            // 2. Handle Section 2 Video
            if ($request->hasFile('section2_video')) {
                 if ($card->section2_video && File::exists(public_path($card->section2_video))) {
                    File::delete(public_path($card->section2_video));
                }
                $file = $request->file('section2_video');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads'), $filename);
                $data['section2_video'] = 'uploads/' . $filename;
            } elseif ($request->input('section2_video') === 'DELETE') {
                if ($card->section2_video && File::exists(public_path($card->section2_video))) {
                    File::delete(public_path($card->section2_video));
                }
                $data['section2_video'] = null;
            }

            // 3. Handle Section 1 Images (Gallery)
            // Existing logic: merge new files with kept existing ones
            $currentImages = $card->section1_images ?? [];
            $keptImages = [];

            // If 'section1_images' is passed as string (JSON of kept images), parse it
            if ($request->has('section1_images')) {
                $val = $request->input('section1_images');
                if (is_string($val)) {
                    $keptImages = json_decode($val, true) ?? [];
                } elseif (is_array($val)) {
                    $keptImages = $val;
                }
            } else {
                // If not sent, assume we keep none? Or keep all? 
                // MERN logic seems to imply it sends the list of strings to keep.
                // If pure file upload, use that.
                // Usually frontend sends existing images as array of strings.
            }
            
            $newImages = [];
            if ($request->hasFile('section1_images')) {
                foreach ($request->file('section1_images') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('uploads'), $filename);
                    $newImages[] = 'uploads/' . $filename;
                }
            }

            // Combine
            $finalImages = array_merge($keptImages, $newImages);
            $data['section1_images'] = $finalImages;

            // Cleanup deleted images (in $currentImages but not in $finalImages)
            // Be careful not to delete files just uploaded (unlikely as they overlap)
            foreach ($currentImages as $oldImg) {
                if (!in_array($oldImg, $finalImages)) {
                    if (File::exists(public_path($oldImg))) {
                         File::delete(public_path($oldImg));
                    }
                }
            }

            // Handle JSON fields
            if (isset($data['buttons']) && is_string($data['buttons'])) {
                $data['buttons'] = json_decode($data['buttons'], true);
            }
            if (isset($data['video_options']) && is_string($data['video_options'])) {
                $data['video_options'] = json_decode($data['video_options'], true);
            }

            // Ensure description isn't literal "null"
            if (isset($data['description']) && ($data['description'] === 'null' || $data['description'] === null)) {
                $data['description'] = '';
            }

            $card->update($data);
            
            // Refresh
            $card = Card::find($id); 
            return response()->json($card);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Reorder cards
    public function reorder(Request $request)
    {
        $orderList = $request->input('order'); // Expects [{id: 1, sort_order: 0}, ...]
        if (is_array($orderList)) {
            foreach ($orderList as $item) {
                if (isset($item['id']) && isset($item['sort_order'])) {
                    Card::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
                }
            }
        }
        return response()->json(['message' => 'Reorder successful']);
    }

    // Delete a card
    public function destroy($id)
    {
        $card = Card::find($id);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        // Delete files
        if ($card->section2_image && File::exists(public_path($card->section2_image))) {
            File::delete(public_path($card->section2_image));
        }
        if ($card->section2_video && File::exists(public_path($card->section2_video))) {
            File::delete(public_path($card->section2_video));
        }
        if (!empty($card->section1_images)) {
            foreach ($card->section1_images as $img) {
                if (File::exists(public_path($img))) {
                    File::delete(public_path($img));
                }
            }
        }

        $card->delete();
        return response()->noContent();
    }
}
