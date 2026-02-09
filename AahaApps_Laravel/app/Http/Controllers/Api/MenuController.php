<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    // Retrieve all menu items
    public function index()
    {
        $menus = Menu::orderBy('order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json($menus);
    }

    // Create a new menu item
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'label' => 'required|string',
                'url' => 'required|string',
                'order' => 'integer|nullable',
                'is_active' => 'boolean|nullable'
            ]);

            $menu = Menu::create($data);
            return response()->json($menu, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Update menu item
    public function update(Request $request, $id)
    {
        try {
            $menu = Menu::find($id);
            if (!$menu) {
                return response()->json(['message' => 'Menu item not found'], 404);
            }

            $menu->update($request->all());
            return response()->json($menu);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Reorder menu items
    public function reorder(Request $request)
    {
        $orderList = $request->input('order'); // Expects [{id: 1, sort_order: 0}, ...]
        if (is_array($orderList)) {
            foreach ($orderList as $item) {
                if (isset($item['id']) && isset($item['sort_order'])) {
                    Menu::where('id', $item['id'])->update(['order' => $item['sort_order']]);
                }
            }
        }
        return response()->json(['message' => 'Menu reorder successful']);
    }

    // Delete menu item
    public function destroy($id)
    {
        $menu = Menu::find($id);
        if (!$menu) {
            return response()->json(['message' => 'Menu item not found'], 404);
        }

        $menu->delete();
        return response()->noContent();
    }
}
