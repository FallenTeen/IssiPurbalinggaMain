import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useState } from 'react';

interface KategoriArtikel {
    id: number;
    nama: string;
}

interface Event {
    id: number;
    nama: string;
}

interface Artikel {
    id: number;
    judul: string;
    slug: string;
    content: string;
    reporter_id: number;
    reporter: User;
    kategori_id: number;
    kategori: KategoriArtikel;
    status: 'draft' | 'review' | 'published' | 'archived';
    rejection_reason: string | null;
    featured_image_url: string | null;
    gallery_urls: string[];
    tags: string[] | null;
    meta_description: string | null;
    tanggal_jadwal_publikasi: string | null;
    event_terkait: number[] | null;
    created_at: string;
    updated_at: string;
}

interface ArtikelEditProps {
    artikel: Artikel;
    kategoris: KategoriArtikel[];
    reporters: User[];
    events: Event[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Artikel',
        href: '/artikels',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function ArtikelEdit({ artikel, kategoris, reporters, events }: ArtikelEditProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [newTag, setNewTag] = useState<string>('');
    const [eventSearch, setEventSearch] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        judul: artikel.judul,
        content: artikel.content,
        reporter_id: String(artikel.reporter_id),
        kategori_id: String(artikel.kategori_id),
        status: artikel.status,
        rejection_reason: artikel.rejection_reason || '',
        featured_image: null as File | null,
        gallery_images: [] as File[],
        tags: artikel.tags || [],
        meta_description: artikel.meta_description || '',
        tanggal_jadwal_publikasi: artikel.tanggal_jadwal_publikasi ? new Date(artikel.tanggal_jadwal_publikasi) : null,
        event_terkait: artikel.event_terkait || [],
    });

    const dynamicBreadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbs.slice(0, 2),
        {
            title: `Edit: ${artikel.judul}`,
            href: route('artikels.edit', artikel.id),
        },
    ];

    const isAdmin = auth.user.roles.includes('admin');
    const isReporter = auth.user.roles.includes('reporter');
    const isVerifikator = auth.user.roles.includes('verifikator');

    const isDisabledForReporterOnPublishedOwnArticle =
        isReporter && !isAdmin && !isVerifikator && artikel.status === 'published' && artikel.reporter_id === auth.user.id;

    const handleAddTag = () => {
        if (newTag.trim() !== '' && !data.tags.includes(newTag.trim())) {
            setData('tags', [...data.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setData(
            'tags',
            data.tags.filter((tag) => tag !== tagToRemove),
        );
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleAddEvent = (eventId: number) => {
        if (!data.event_terkait.includes(eventId)) {
            setData('event_terkait', [...data.event_terkait, eventId]);
        }
    };

    const handleRemoveEvent = (eventId: number) => {
        setData(
            'event_terkait',
            data.event_terkait.filter((id) => id !== eventId),
        );
    };

    const filteredEvents = events.filter((event) => event.nama.toLowerCase().includes(eventSearch.toLowerCase()));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('_method', 'put');
        formData.append('judul', data.judul);
        formData.append('content', data.content);
        formData.append('reporter_id', data.reporter_id);
        formData.append('kategori_id', data.kategori_id);
        formData.append('meta_description', data.meta_description || '');

        let submissionStatus = data.status;
        if (isDisabledForReporterOnPublishedOwnArticle) {
            submissionStatus = 'draft';
            formData.append('rejection_reason', 'Diubah oleh reporter setelah publikasi.');
        } else if (isReporter && submissionStatus === 'published' && artikel.status !== 'published' && !isAdmin && !isVerifikator) {
            submissionStatus = 'review';
        }
        formData.append('status', submissionStatus);

        if (data.rejection_reason && (isAdmin || isVerifikator)) {
            formData.append('rejection_reason', data.rejection_reason);
        }

        data.tags.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
        });

        data.event_terkait.forEach((eventId, index) => {
            formData.append(`event_terkait[${index}]`, eventId.toString());
        });

        if (data.tanggal_jadwal_publikasi) {
            const formattedDate = format(data.tanggal_jadwal_publikasi, 'yyyy-MM-dd');
            formData.append('tanggal_jadwal_publikasi', formattedDate);
        } else {
            formData.append('tanggal_jadwal_publikasi', '');
        }

        if (data.featured_image) {
            formData.append('featured_image', data.featured_image);
        }
        data.gallery_images.forEach((image, index) => {
            formData.append(`gallery_images[${index}]`, image);
        });

        post(route('artikels.update', artikel.id), {
            data: formData,
            onSuccess: () => {},
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join('\n');
                alert('Gagal memperbarui artikel:\n' + errorMessage);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Edit Artikel: ${artikel.judul}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">Edit Artikel</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Artikel</CardTitle>
                        <CardDescription>Perbarui detail artikel ini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="judul">Judul</Label>
                                    <Input
                                        id="judul"
                                        type="text"
                                        value={data.judul}
                                        onChange={(e) => setData('judul', e.target.value)}
                                        className={errors.judul ? 'border-destructive' : ''}
                                        disabled={isDisabledForReporterOnPublishedOwnArticle}
                                    />
                                    {errors.judul && <p className="mt-1 text-sm text-destructive">{errors.judul}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="content">Konten</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className={errors.content ? 'border-destructive' : ''}
                                        rows={10}
                                        disabled={isDisabledForReporterOnPublishedOwnArticle}
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
                                </div>
                                <div>
                                    <Label>Gambar Unggulan Saat Ini</Label>
                                    {artikel.featured_image_url ? (
                                        <img src={artikel.featured_image_url} alt="Featured Image" className="my-2 h-auto max-w-xs rounded-md" />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Tidak ada gambar unggulan saat ini.</p>
                                    )}
                                    <Label htmlFor="featured_image">Ganti Gambar Unggulan</Label>
                                    <Input
                                        id="featured_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('featured_image', e.target.files ? e.target.files[0] : null)}
                                        className={errors.featured_image ? 'border-destructive' : ''}
                                        disabled={isDisabledForReporterOnPublishedOwnArticle}
                                    />
                                    {errors.featured_image && <p className="mt-1 text-sm text-destructive">{errors.featured_image}</p>}
                                </div>
                                <div>
                                    <Label>Gambar Galeri Saat Ini</Label>
                                    <div className="my-2 flex flex-wrap gap-2">
                                        {artikel.gallery_urls?.length > 0 ? (
                                            artikel.gallery_urls.map((url, index) => (
                                                <img
                                                    key={index}
                                                    src={url}
                                                    alt={`Gallery Image ${index + 1}`}
                                                    className="h-24 w-24 rounded-md object-cover"
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Tidak ada gambar galeri saat ini.</p>
                                        )}
                                    </div>
                                    <Label htmlFor="gallery_images">Tambah Gambar Galeri</Label>
                                    <Input
                                        id="gallery_images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setData('gallery_images', Array.from(e.target.files || []) as File[])}
                                        className={errors.gallery_images ? 'border-destructive' : ''}
                                        disabled={isDisabledForReporterOnPublishedOwnArticle}
                                    />
                                    {errors.gallery_images && <p className="mt-1 text-sm text-destructive">{errors.gallery_images}</p>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="reporter_id">Reporter</Label>
                                    <Select
                                        onValueChange={(value) => setData('reporter_id', value)}
                                        value={data.reporter_id}
                                        disabled={isReporter && !isAdmin}
                                    >
                                        <SelectTrigger id="reporter_id" className={errors.reporter_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih Reporter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reporters.map((reporter) => (
                                                <SelectItem key={reporter.id} value={String(reporter.id)}>
                                                    {reporter.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.reporter_id && <p className="mt-1 text-sm text-destructive">{errors.reporter_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="kategori_id">Kategori</Label>
                                    <Select
                                        onValueChange={(value) => setData('kategori_id', value)}
                                        value={data.kategori_id}
                                        disabled={isDisabledForReporterOnPublishedOwnArticle}
                                    >
                                        <SelectTrigger id="kategori_id" className={errors.kategori_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kategoris.map((kategori) => (
                                                <SelectItem key={kategori.id} value={String(kategori.id)}>
                                                    {kategori.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.kategori_id && <p className="mt-1 text-sm text-destructive">{errors.kategori_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        onValueChange={(value: 'draft' | 'review' | 'published' | 'archived') => setData('status', value)}
                                        value={data.status}
                                        disabled={isDisabledForReporterOnPublishedOwnArticle || (isReporter && !isAdmin && !isVerifikator)}
                                    >
                                        <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            {(isAdmin || isVerifikator) && <SelectItem value="published">Published</SelectItem>}
                                            {(isAdmin || isVerifikator) && <SelectItem value="archived">Archived</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="mt-1 text-sm text-destructive">{errors.status}</p>}
                                </div>
                                {(artikel.rejection_reason && (isAdmin || isVerifikator)) || (data.rejection_reason && (isAdmin || isVerifikator)) ? (
                                    <div>
                                        <Label htmlFor="rejection_reason">Alasan Penolakan/Revisi</Label>
                                        <Textarea
                                            id="rejection_reason"
                                            value={data.rejection_reason}
                                            onChange={(e) => setData('rejection_reason', e.target.value)}
                                            className={errors.rejection_reason ? 'border-destructive' : ''}
                                            rows={3}
                                            placeholder="Masukkan alasan penolakan jika artikel ditolak atau dikembalikan ke draft."
                                            disabled={isDisabledForReporterOnPublishedOwnArticle || (!isAdmin && !isVerifikator)}
                                        />
                                        {errors.rejection_reason && <p className="mt-1 text-sm text-destructive">{errors.rejection_reason}</p>}
                                    </div>
                                ) : null}
                                <div>
                                    <Label htmlFor="tags">Tags</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="new-tag"
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={handleTagInputKeyDown}
                                            placeholder="Tekan Enter atau Koma untuk menambah tag"
                                            className={errors.tags ? 'border-destructive' : ''}
                                            disabled={isDisabledForReporterOnPublishedOwnArticle}
                                        />
                                        <Button type="button" onClick={handleAddTag} disabled={isDisabledForReporterOnPublishedOwnArticle}>
                                            Add Tag
                                        </Button>
                                    </div>
                                    {errors.tags && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {Array.isArray(errors.tags) ? errors.tags.join(', ') : errors.tags}
                                        </p>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white"
                                                    disabled={isDisabledForReporterOnPublishedOwnArticle}
                                                >
                                                    <span className="sr-only">Remove {tag}</span>
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="event_terkait">Event Terkait</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn('w-full justify-start font-normal', errors.event_terkait && 'border-destructive')}
                                                disabled={isDisabledForReporterOnPublishedOwnArticle}
                                            >
                                                {data.event_terkait.length > 0 ? `${data.event_terkait.length} event dipilih` : 'Pilih event terkait'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Cari event..." value={eventSearch} onValueChange={setEventSearch} />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ada event ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredEvents.map((event) => (
                                                            <CommandItem
                                                                key={event.id}
                                                                onSelect={() => {
                                                                    if (data.event_terkait.includes(event.id)) {
                                                                        handleRemoveEvent(event.id);
                                                                    } else {
                                                                        handleAddEvent(event.id);
                                                                    }
                                                                }}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Checkbox
                                                                    checked={data.event_terkait.includes(event.id)}
                                                                    onCheckedChange={() => {
                                                                        if (data.event_terkait.includes(event.id)) {
                                                                            handleRemoveEvent(event.id);
                                                                        } else {
                                                                            handleAddEvent(event.id);
                                                                        }
                                                                    }}
                                                                />
                                                                {event.nama}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.event_terkait && <p className="mt-1 text-sm text-destructive">{errors.event_terkait}</p>}
                                    {data.event_terkait.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {data.event_terkait.map((eventId) => {
                                                const event = events.find((e) => e.id === eventId);
                                                return event ? (
                                                    <span
                                                        key={event.id}
                                                        className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                                                    >
                                                        {event.nama}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEvent(event.id)}
                                                            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:bg-green-500 focus:text-white"
                                                            disabled={isDisabledForReporterOnPublishedOwnArticle}
                                                        >
                                                            <span className="sr-only">Remove {event.nama}</span>
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="tanggal_jadwal_publikasi">Tanggal Jadwal Publikasi</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !data.tanggal_jadwal_publikasi && 'text-muted-foreground',
                                                    errors.tanggal_jadwal_publikasi && 'border-destructive',
                                                )}
                                                type="button"
                                                disabled={isDisabledForReporterOnPublishedOwnArticle}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.tanggal_jadwal_publikasi ? (
                                                    format(data.tanggal_jadwal_publikasi, 'dd/MM/yyyy')
                                                ) : (
                                                    <span>Pilih tanggal</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={data.tanggal_jadwal_publikasi || undefined}
                                                onSelect={(date) => setData('tanggal_jadwal_publikasi', date || null)}
                                                initialFocus
                                                disabled={(date) => date < new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.tanggal_jadwal_publikasi && (
                                        <p className="mt-1 text-sm text-destructive">{errors.tanggal_jadwal_publikasi}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 lg:col-span-2">
                                <Link href={route('artikels.show', artikel.slug)}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing || isDisabledForReporterOnPublishedOwnArticle}>
                                    Perbarui Artikel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
