<?php

namespace App\Http\Controllers;

use App\Models\KategoriArtikel;
use Illuminate\Http\Request;

class KategoriArtikelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = KategoriArtikel::query();

        if ($request->has('active')) {
            $query->active();
        }

        if ($request->has('parent')) {
            $query->parent();
        }

        $query->orderBySortOrder();

        $kategoris = $query->paginate(10);

        return view('kategori_artikels.index', compact('kategoris'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentKategoris = KategoriArtikel::parent()->get();
        return view('kategori_artikels.create', compact('parentKategoris'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:kategori_artikel,nama',
            'deskripsi' => 'nullable|string',
            'color_code' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:kategori_artikel,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        KategoriArtikel::create($request->all());

        return redirect()->route('kategori_artikels.index')->with('success', 'Kategori Artikel berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(KategoriArtikel $kategoriArtikel)
    {
        return view('kategori_artikels.show', compact('kategoriArtikel'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(KategoriArtikel $kategoriArtikel)
    {
        $parentKategoris = KategoriArtikel::parent()->where('id', '!=', $kategoriArtikel->id)->get();
        return view('kategori_artikels.edit', compact('kategoriArtikel', 'parentKategoris'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, KategoriArtikel $kategoriArtikel)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:kategori_artikel,nama,' . $kategoriArtikel->id,
            'deskripsi' => 'nullable|string',
            'color_code' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:kategori_artikel,id',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ]);

        $kategoriArtikel->update($request->all());

        return redirect()->route('kategori_artikels.show', $kategoriArtikel)->with('success', 'Kategori Artikel berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KategoriArtikel $kategoriArtikel)
    {
        if ($kategoriArtikel->children()->exists() || $kategoriArtikel->artikels()->exists()) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena memiliki sub-kategori atau artikel terkait.');
        }

        $kategoriArtikel->delete();
        return redirect()->route('kategori_artikels.index')->with('success', 'Kategori Artikel berhasil dihapus!');
    }
}
