import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface EventFormData {
  nama: string;
  type: string;
  kategori: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  deskripsi: string;
  max_participants: number | null;
  registration_fee: number | null;
  difficulty_level: string;
  requirements: string[];
  weather_dependency: boolean;
  terrain_type: string;
  elevation_gain: number | null;
  jarak_km: number | null;
  status: string;
  banner_image: File | null;
  gallery_images: File[];
  event_features: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Events',
    href: '/events',
  },
  {
    title: 'Buat Event',
    href: '/events/create',
  },
];

export default function Create() {
  const [newRequirement, setNewRequirement] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const { data, setData, post, processing, errors } = useForm<EventFormData>({
    nama: '',
    type: '',
    kategori: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    deskripsi: '',
    max_participants: null,
    registration_fee: null,
    difficulty_level: '',
    requirements: [],
    weather_dependency: false,
    terrain_type: '',
    elevation_gain: null,
    jarak_km: null,
    status: 'draft',
    banner_image: null,
    gallery_images: [],
    event_features: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/events');
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setData('requirements', [...data.requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setData('requirements', data.requirements.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setData('event_features', [...data.event_features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setData('event_features', data.event_features.filter((_, i) => i !== index));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('banner_image', file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setData('gallery_images', [...data.gallery_images, ...files]);
  };

  const removeGalleryImage = (index: number) => {
    setData('gallery_images', data.gallery_images.filter((_, i) => i !== index));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buat Event Baru" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Buat Event Baru</h2>
          <p className="text-muted-foreground">Lengkapi informasi event yang akan diselenggarakan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Informasi utama tentang event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Event *</Label>
                  <Input
                    id="nama"
                    value={data.nama}
                    onChange={(e) => setData('nama', e.target.value)}
                    className={errors.nama ? 'border-red-500' : ''}
                  />
                  {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lokasi">Lokasi *</Label>
                  <Input
                    id="lokasi"
                    value={data.lokasi}
                    onChange={(e) => setData('lokasi', e.target.value)}
                    className={errors.lokasi ? 'border-red-500' : ''}
                  />
                  {errors.lokasi && <p className="text-sm text-red-500">{errors.lokasi}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi *</Label>
                <Textarea
                  id="deskripsi"
                  value={data.deskripsi}
                  onChange={(e) => setData('deskripsi', e.target.value)}
                  rows={4}
                  className={errors.deskripsi ? 'border-red-500' : ''}
                />
                {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tanggal_mulai">Tanggal Mulai *</Label>
                  <Input
                    id="tanggal_mulai"
                    type="datetime-local"
                    value={data.tanggal_mulai}
                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                    className={errors.tanggal_mulai ? 'border-red-500' : ''}
                  />
                  {errors.tanggal_mulai && <p className="text-sm text-red-500">{errors.tanggal_mulai}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggal_selesai">Tanggal Selesai *</Label>
                  <Input
                    id="tanggal_selesai"
                    type="datetime-local"
                    value={data.tanggal_selesai}
                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                    className={errors.tanggal_selesai ? 'border-red-500' : ''}
                  />
                  {errors.tanggal_selesai && <p className="text-sm text-red-500">{errors.tanggal_selesai}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Kategori Event</CardTitle>
              <CardDescription>Tentukan jenis dan kategori event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tipe Event *</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih tipe event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="downhill">Downhill</SelectItem>
                      <SelectItem value="roadbike">Road Bike</SelectItem>
                      <SelectItem value="unsupported">Unsupported</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Kategori *</Label>
                  <Select value={data.kategori} onValueChange={(value) => setData('kategori', value)}>
                    <SelectTrigger className={errors.kategori ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amatir">Amatir</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.kategori && <p className="text-sm text-red-500">{errors.kategori}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Tingkat Kesulitan *</Label>
                  <Select value={data.difficulty_level} onValueChange={(value) => setData('difficulty_level', value)}>
                    <SelectTrigger className={errors.difficulty_level ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih tingkat kesulitan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Mudah</SelectItem>
                      <SelectItem value="medium">Menengah</SelectItem>
                      <SelectItem value="hard">Sulit</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.difficulty_level && <p className="text-sm text-red-500">{errors.difficulty_level}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Jenis Terrain *</Label>
                  <Select value={data.terrain_type} onValueChange={(value) => setData('terrain_type', value)}>
                    <SelectTrigger className={errors.terrain_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih jenis terrain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">Road</SelectItem>
                      <SelectItem value="mountain">Mountain</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.terrain_type && <p className="text-sm text-red-500">{errors.terrain_type}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Detail Event</CardTitle>
              <CardDescription>Informasi teknis event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Maksimal Peserta</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    value={data.max_participants || ''}
                    onChange={(e) => setData('max_participants', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_fee">Biaya Pendaftaran (Rp)</Label>
                  <Input
                    id="registration_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.registration_fee || ''}
                    onChange={(e) => setData('registration_fee', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jarak_km">Jarak (KM)</Label>
                  <Input
                    id="jarak_km"
                    type="number"
                    min="0"
                    step="0.1"
                    value={data.jarak_km || ''}
                    onChange={(e) => setData('jarak_km', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="elevation_gain">Elevation Gain (m)</Label>
                  <Input
                    id="elevation_gain"
                    type="number"
                    min="0"
                    value={data.elevation_gain || ''}
                    onChange={(e) => setData('elevation_gain', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="weather_dependency"
                  checked={data.weather_dependency}
                  onCheckedChange={(checked) => setData('weather_dependency', checked)}
                />
                <Label htmlFor="weather_dependency">Bergantung pada cuaca</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Persyaratan</CardTitle>
              <CardDescription>Persyaratan untuk mengikuti event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah persyaratan..."
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {req}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeRequirement(index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Fitur Event</CardTitle>
              <CardDescription>Fitur-fitur yang tersedia dalam event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah fitur..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.event_features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {feature}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeFeature(index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Gambar Event</CardTitle>
              <CardDescription>Upload banner dan galeri foto event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="banner_image">Banner Event</Label>
                <Input
                  id="banner_image"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className={errors.banner_image ? 'border-red-500' : ''}
                />
                {errors.banner_image && <p className="text-sm text-red-500">{errors.banner_image}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gallery_images">Galeri Foto</Label>
                <Input
                  id="gallery_images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />

                {data.gallery_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.gallery_images.map((file, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {file.name}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeGalleryImage(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Status Event</CardTitle>
              <CardDescription>Tentukan status publikasi event</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Dipublikasi</SelectItem>
                  <SelectItem value="registration_open">Pendaftaran Dibuka</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Batal
            </Button>
            <Button type="submit" disabled={processing} className="shadow-lg">
              {processing ? 'Menyimpan...' : 'Simpan Event'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
