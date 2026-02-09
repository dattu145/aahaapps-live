<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    // Retrieve all pages (Admin needs full list)
    public function index()
    {
        // Return all pages, ordered most recent first
        $pages = Page::orderBy('created_at', 'desc')->get();
        return response()->json($pages);
    }

    // Retrieve a single page by ID or Slug
    public function show($id)
    {
        // Try getting by ID first (Admin Edit - allow inactive)
        if (is_numeric($id)) {
            $page = Page::find($id);
            if ($page) {
                return response()->json($page);
            }
        }
        
        // If not found or not numeric, try slug (Public View - enforce active)
        $page = Page::where('slug', $id)->where('is_active', true)->first();

        if (!$page) {
            // Check if it exists but is inactive, to be helpful?
            // No, strictly 404 for public consistency
            return response()->json(['message' => 'Page not found'], 404);
        }
        return response()->json($page);
    }

    // Create a new page
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'title' => 'required|string',
                'slug' => 'required|string|unique:pages,slug',
                'content' => 'required|string',
                'is_active' => 'boolean'
            ]);

            $page = Page::create($data);
            return response()->json($page, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Update page
    public function update(Request $request, $id)
    {
        try {
            $page = Page::find($id);
            if (!$page) {
                return response()->json(['message' => 'Page not found'], 404);
            }
            
            // Allow slug update only if unique
            if ($request->has('slug') && $request->slug != $page->slug) {
                $request->validate(['slug' => 'unique:pages,slug']);
            }

            $page->update($request->all());
            return response()->json($page);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Delete page
    public function destroy($id)
    {
        $page = Page::find($id);
        if (!$page) {
            return response()->json(['message' => 'Page not found'], 404);
        }

        $page->delete();
        return response()->noContent();
    }
}
