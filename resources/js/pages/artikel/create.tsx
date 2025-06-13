import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface KategoriArtikel {
    id: number;
    nama: string;
}

interface Event {
    id: number;
    nama: string;
}

interface ArtikelCreateProps {
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
        title: 'Buat Baru',
        href: '/artikels/create',
    },
];

export default function ArtikelCreate({ kategoris, reporters, events }: ArtikelCreateProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [newTag, setNewTag] = useState<string>('');
    const [eventSearch, setEventSearch] = useState<string>('');

    const isAdmin = auth.user.roles.includes('admin');
    const isReporter = auth.user.roles.includes('reporter');
    const isVerifikator = auth.user.roles.includes('verifikator');

    const { data, setData, post, processing, errors } = useForm({
        judul: '',
        content: '',
        reporter_id: auth.user.id.toString(),
        kategori_id: '',
        status: (isReporter && !isAdmin && !isVerifikator) ? 'review' : 'draft',
        featured_image: null as File | null,
        gallery_images: [] as File[],
        tags: [] as string[],
        meta_description: '',
        tanggal_jadwal_publikasi: null as Date | null,
        event_terkait: [] as number[],
    });

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
        setData('event_terkait', data.event_terkait.filter((id) => id !== eventId));
    };

    const filteredEvents = events.filter(event =>
        event.nama.toLowerCase().includes(eventSearch.toLowerCase())
    );


    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('judul', data.judul);
        formData.append('content', data.content);
        formData.append('reporter_id', data.reporter_id);
        formData.append('kategori_id', data.kategori_id);
        formData.append('meta_description', data.meta_description || '');
        formData.append('status', data.status);

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

        post(route('artikels.store'), {
            data: formData,
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join('\n');
                alert('Gagal menyimpan artikel:\n' + errorMessage);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Artikel Baru" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">Buat Artikel Baru</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Artikel</CardTitle>
                        <CardDescription>Isi detail untuk artikel baru.</CardDescription>
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
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="featured_image">Gambar Unggulan</Label>
                                    <Input
                                        id="featured_image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('featured_image', e.target.files ? e.target.files[0] : null)}
                                        className={errors.featured_image ? 'border-destructive' : ''}
                                    />
                                    {errors.featured_image && <p className="mt-1 text-sm text-destructive">{errors.featured_image}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="gallery_images">Gambar Galeri</Label>
                                    <Input
                                        id="gallery_images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setData('gallery_images', Array.from(e.target.files || []) as File[])}
                                        className={errors.gallery_images ? 'border-destructive' : ''}
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
                                    <Select onValueChange={(value) => setData('kategori_id', value)} value={data.kategori_id}>
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
                                        disabled={isReporter && !isAdmin && !isVerifikator}
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
                                        />
                                        <Button type="button" onClick={handleAddTag}>
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
                                                >
                                                    <span className="sr-only">Remove {tag}</span>
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="meta_description">Meta Deskripsi</Label>
                                    <Textarea
                                        id="meta_description"
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        className={errors.meta_description ? 'border-destructive' : ''}
                                        rows={3}
                                    />
                                    {errors.meta_description && <p className="mt-1 text-sm text-destructive">{errors.meta_description}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="event_terkait">Event Terkait</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start font-normal"
                                            >
                                                {data.event_terkait.length > 0
                                                    ? `${data.event_terkait.length} event dipilih`
                                                    : "Pilih event terkait"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Cari event..."
                                                    value={eventSearch}
                                                    onValueChange={setEventSearch}
                                                />
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
                                                const event = events.find(e => e.id === eventId);
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
                                <Link href={route('artikels.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Buat Artikel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
