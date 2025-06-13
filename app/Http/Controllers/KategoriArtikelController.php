<?php

namespace App\Http\Controllers;

use App\Models\KategoriArtikel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KategoriArtikelController extends Controller
{
    public function index(Request $request)
    {
        $query = KategoriArtikel::query();

        if ($request->has('active')) {
            $query->active();
        }

        if ($request->input('parent') === '0') {
            $query->whereNull('parent_id');
        } elseif ($request->input('parent') === '1') {
            $query->whereNotNull('parent_id');
        }

        $query->orderBySortOrder();

        $kategoris = $query->paginate(10);
        return Inertia::render('kategoriartikel/index', [
            'kategoris' => $kategoris,
            'filters' => $request->only(['active', 'parent']),
        ]);
    }

    public function create()
    {
        $parentKategoris = KategoriArtikel::orderBy('nama')->whereNull('parent_id')->get();
        return Inertia::render('kategoriartikel/create', [
            'parentKategoris' => $parentKategoris,
        ]);
    }

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

        return redirect()->route('kategoriartikel.index')->with('success', 'Kategori Artikel berhasil ditambahkan!');
    }

    public function show(KategoriArtikel $kategoriArtikel)
    {
        return Inertia::render('kategoriartikel/show', [
            'kategoriArtikel' => $kategoriArtikel,
        ]);
    }

    public function edit(KategoriArtikel $kategoriArtikel)
    {
        $parentKategoris = KategoriArtikel::orderBy('nama')
            ->whereNull('parent_id')
            ->where('id', '!=', $kategoriArtikel->id)
            ->get();
        return Inertia::render('kategoriartikel/edit', [
            'kategoriArtikel' => $kategoriArtikel,
            'parentKategoris' => $parentKategoris,
        ]);
    }

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

        return redirect()->route('kategoriartikel.show', $kategoriArtikel)->with('success', 'Kategori Artikel berhasil diperbarui!');
    }

    public function destroy(KategoriArtikel $kategoriArtikel)
    {
        if ($kategoriArtikel->children()->exists() || $kategoriArtikel->artikels()->exists()) {
            return redirect()->back()->with('error', 'Kategori tidak dapat dihapus karena memiliki sub-kategori atau artikel terkait.');
        }

        $kategoriArtikel->delete();
        return redirect()->route('kategoriartikel.index')->with('success', 'Kategori Artikel berhasil dihapus!');
    }
}
