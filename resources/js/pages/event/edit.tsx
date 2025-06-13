import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Camera, Mountain, Plus, Trash2, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Event {
    id: number;
    nama: string;
    slug: string;
    type: string;
    kategori: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lokasi: string;
    deskripsi: string;
    max_participants: number | null;
    registration_fee: number | null;
    difficulty_level: string;
    requirements: string[] | null;
    weather_dependency: boolean;
    terrain_type: string;
    elevation_gain: number | null;
    jarak_km: number | null;
    status: string;
    banner_image_url: string | null;
    gallery_urls: string[] | null;
    event_features: string[] | null;
}

interface Props {
    event: Event;
}

const ensureArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    return [];
};

export default function Edit({ event }: Props) {
    const [requirements, setRequirements] = useState<string[]>(ensureArray(event.requirements));
    const [eventFeatures, setEventFeatures] = useState<string[]>(ensureArray(event.event_features));
    const [newRequirement, setNewRequirement] = useState('');
    const [newFeature, setNewFeature] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        nama: event.nama,
        type: event.type,
        kategori: event.kategori,
        tanggal_mulai: event.tanggal_mulai.split('T')[0],
        tanggal_selesai: event.tanggal_selesai.split('T')[0],
        lokasi: event.lokasi,
        deskripsi: event.deskripsi,
        max_participants: event.max_participants || '',
        registration_fee: event.registration_fee || '',
        difficulty_level: event.difficulty_level,
        requirements: requirements,
        weather_dependency: event.weather_dependency,
        terrain_type: event.terrain_type,
        elevation_gain: event.elevation_gain || '',
        jarak_km: event.jarak_km || '',
        status: event.status,
        banner_image: null as File | null,
        gallery_images: [] as File[],
        event_features: eventFeatures,
        _method: 'PUT',
    });

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
            title: event.nama,
            href: `/events-show/${event.slug}`,
        },
        {
            title: 'Edit',
            href: `/events/${event.id}/edit`,
        },
    ];

    useEffect(() => {
        setData('requirements', requirements);
    }, [requirements]);

    useEffect(() => {
        setData('event_features', eventFeatures);
    }, [eventFeatures]);

    const addRequirement = () => {
        if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
            setRequirements([...requirements, newRequirement.trim()]);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        setRequirements(requirements.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (newFeature.trim() && !eventFeatures.includes(newFeature.trim())) {
            setEventFeatures([...eventFeatures, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setEventFeatures(eventFeatures.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('events.update', event.id));
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
            router.delete(route('events.destroy', event.id));
        }
    };

    const statusOptions = [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'registration_open', label: 'Registration Open' },
        { value: 'registration_closed', label: 'Registration Closed' },
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Event - ${event.nama}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" onClick={() => router.get(route('events.show', event.slug))} className="shadow-sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
                            <p className="text-muted-foreground">Perbarui informasi event cycling</p>
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleDelete} className="flex items-center space-x-2 shadow-lg">
                        <Trash2 className="h-4 w-4" />
                        <span>Hapus Event</span>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Trophy className="h-5 w-5" />
                                <span>Informasi Dasar</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="nama">Nama Event</Label>
                                    <Input
                                        id="nama"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        className={errors.nama ? 'border-red-500' : ''}
                                    />
                                    {errors.nama && <p className="mt-1 text-sm text-red-500">{errors.nama}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="type">Tipe Event</Label>
                                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="downhill">Downhill</SelectItem>
                                            <SelectItem value="roadbike">Road Bike</SelectItem>
                                            <SelectItem value="unsupported">Unsupported</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="kategori">Kategori</Label>
                                    <Select value={data.kategori} onValueChange={(value) => setData('kategori', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="amatir">Amatir</SelectItem>
                                            <SelectItem value="professional">Professional</SelectItem>
                                            <SelectItem value="junior">Junior</SelectItem>
                                            <SelectItem value="senior">Senior</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="lokasi">Lokasi</Label>
                                <Input
                                    id="lokasi"
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                    className={errors.lokasi ? 'border-red-500' : ''}
                                />
                                {errors.lokasi && <p className="mt-1 text-sm text-red-500">{errors.lokasi}</p>}
                            </div>

                            <div>
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    rows={4}
                                    className={errors.deskripsi ? 'border-red-500' : ''}
                                />
                                {errors.deskripsi && <p className="mt-1 text-sm text-red-500">{errors.deskripsi}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5" />
                                <span>Waktu & Tempat</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
                                    <Input
                                        id="tanggal_mulai"
                                        type="date"
                                        value={data.tanggal_mulai}
                                        onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                        className={errors.tanggal_mulai ? 'border-red-500' : ''}
                                    />
                                    {errors.tanggal_mulai && <p className="mt-1 text-sm text-red-500">{errors.tanggal_mulai}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
                                    <Input
                                        id="tanggal_selesai"
                                        type="date"
                                        value={data.tanggal_selesai}
                                        onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                        className={errors.tanggal_selesai ? 'border-red-500' : ''}
                                    />
                                    {errors.tanggal_selesai && <p className="mt-1 text-sm text-red-500">{errors.tanggal_selesai}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Mountain className="h-5 w-5" />
                                <span>Detail Teknis</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label htmlFor="difficulty_level">Level Kesulitan</Label>
                                    <Select value={data.difficulty_level} onValueChange={(value) => setData('difficulty_level', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Mudah</SelectItem>
                                            <SelectItem value="medium">Menengah</SelectItem>
                                            <SelectItem value="hard">Sulit</SelectItem>
                                            <SelectItem value="expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="terrain_type">Tipe Terrain</Label>
                                    <Select value={data.terrain_type} onValueChange={(value) => setData('terrain_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="road">Road</SelectItem>
                                            <SelectItem value="mountain">Mountain</SelectItem>
                                            <SelectItem value="mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="jarak_km">Jarak (KM)</Label>
                                    <Input
                                        id="jarak_km"
                                        type="number"
                                        step="0.1"
                                        value={data.jarak_km}
                                        onChange={(e) => setData('jarak_km', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="elevation_gain">Elevation Gain (m)</Label>
                                    <Input
                                        id="elevation_gain"
                                        type="number"
                                        value={data.elevation_gain}
                                        onChange={(e) => setData('elevation_gain', e.target.value)}
                                    />
                                </div>

                                <div className="mt-6 flex items-center space-x-2">
                                    <Checkbox
                                        id="weather_dependency"
                                        checked={data.weather_dependency}
                                        onCheckedChange={(checked) => setData('weather_dependency', checked as boolean)}
                                    />
                                    <Label htmlFor="weather_dependency">Bergantung pada Cuaca</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Pendaftaran & Biaya</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="max_participants">Maksimal Peserta</Label>
                                    <Input
                                        id="max_participants"
                                        type="number"
                                        value={data.max_participants}
                                        onChange={(e) => setData('max_participants', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="registration_fee">Biaya Pendaftaran (Rp)</Label>
                                    <Input
                                        id="registration_fee"
                                        type="number"
                                        step="0.01"
                                        value={data.registration_fee}
                                        onChange={(e) => setData('registration_fee', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Persyaratan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Tambah persyaratan..."
                                    value={newRequirement}
                                    onChange={(e) => setNewRequirement(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                />
                                <Button type="button" onClick={addRequirement}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {requirements.map((req, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                        <span>{req}</span>
                                        <button type="button" onClick={() => removeRequirement(index)} className="ml-1 hover:text-red-500">
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle>Fitur Event</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Tambah fitur event..."
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <Button type="button" onClick={addFeature}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {eventFeatures.map((feature, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                                        <span>{feature}</span>
                                        <button type="button" onClick={() => removeFeature(index)} className="ml-1 hover:text-red-500">
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Camera className="h-5 w-5" />
                                <span>Media</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="banner_image">Banner Image</Label>
                                <Input
                                    id="banner_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('banner_image', e.target.files?.[0] || null)}
                                />
                                {event.banner_image_url && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Current banner:</p>
                                        <img src={event.banner_image_url} alt="Current banner" className="h-20 w-32 rounded object-cover shadow-sm" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="gallery_images">Gallery Images</Label>
                                <Input
                                    id="gallery_images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setData('gallery_images', Array.from(e.target.files || []))}
                                />
                                {event.gallery_urls && event.gallery_urls.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">Current gallery:</p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {event.gallery_urls.map((url, index) => (
                                                <img
                                                    key={index}
                                                    src={url}
                                                    alt={`Gallery ${index + 1}`}
                                                    className="h-20 w-20 rounded object-cover shadow-sm"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4 pt-6">
                        <Button type="button" variant="outline" onClick={() => router.get(route('events.show', event.slug))} className="shadow-sm">
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="shadow-lg">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
