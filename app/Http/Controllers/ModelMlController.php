<?php

namespace App\Http\Controllers;

use App\Models\ModelMl;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ModelMlController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ModelMl::with('creator');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $models = $query->latest()->paginate(10);

        return view('model_mls.index', compact('models'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('model_mls.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_model' => 'required|string|max:255',
            'tipe_model' => 'required|string|max:255',
            'versi' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'model_path' => 'required|string|max:255',
            'model_parameters' => 'nullable|array',
            'training_data_info' => 'nullable|array',
            'accuracy_score' => 'nullable|numeric|min:0|max:1',
            'precision_score' => 'nullable|numeric|min:0|max:1',
            'recall_score' => 'nullable|numeric|min:0|max:1',
            'f1_score' => 'nullable|numeric|min:0|max:1',
            'status' => 'required|in:training,ready,failed,deprecated',
            'is_active' => 'boolean',
            'training_samples' => 'nullable|integer|min:0',
            'validation_samples' => 'nullable|integer|min:0',
        ]);

        $modelData = $request->all();
        $modelData['created_by'] = auth()->id(); // Assuming authenticated user is the creator

        ModelMl::create($modelData);

        return redirect()->route('model_mls.index')->with('success', 'Model ML berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ModelMl $modelMl)
    {
        return view('model_mls.show', compact('modelMl'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ModelMl $modelMl)
    {
        return view('model_mls.edit', compact('modelMl'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ModelMl $modelMl)
    {
        $request->validate([
            'nama_model' => 'required|string|max:255',
            'tipe_model' => 'required|string|max:255',
            'versi' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'model_path' => 'required|string|max:255',
            'model_parameters' => 'nullable|array',
            'training_data_info' => 'nullable|array',
            'accuracy_score' => 'nullable|numeric|min:0|max:1',
            'precision_score' => 'nullable|numeric|min:0|max:1',
            'recall_score' => 'nullable|numeric|min:0|max:1',
            'f1_score' => 'nullable|numeric|min:0|max:1',
            'status' => 'required|in:training,ready,failed,deprecated',
            'is_active' => 'boolean',
            'training_samples' => 'nullable|integer|min:0',
            'validation_samples' => 'nullable|integer|min:0',
        ]);

        $modelMl->update($request->all());

        return redirect()->route('model_mls.show', $modelMl)->with('success', 'Model ML berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ModelMl $modelMl)
    {
        $modelMl->delete();
        return redirect()->route('model_mls.index')->with('success', 'Model ML berhasil dihapus!');
    }

    /**
     * Activate the specified ML model.
     */
    public function activate(ModelMl $modelMl)
    {
        $modelMl->activate();
        return redirect()->back()->with('success', 'Model ML berhasil diaktifkan.');
    }

    /**
     * Get performance metrics for the specified ML model.
     */
    public function getPerformance(ModelMl $modelMl)
    {
        $metrics = $modelMl->getPerformanceMetrics();
        return response()->json($metrics);
    }

    /**
     * Get the active model by type.
     */
    public function getActiveModel($type)
    {
        $model = ModelMl::getActiveModelByType($type);
        if (!$model) {
            return response()->json(['message' => 'No active model found for this type.'], 404);
        }
        return response()->json($model);
    }
}
