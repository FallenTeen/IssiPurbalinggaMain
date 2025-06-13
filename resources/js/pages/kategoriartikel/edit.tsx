import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface KategoriArtikel {
    id: number;
    nama: string;
    deskripsi: string | null;
    color_code: string | null;
    icon: string | null;
    parent_id: number | null;
    sort_order: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ParentKategori {
    id: number;
    nama: string;
}

interface KategoriArtikelEditProps {
    kategoriArtikel: KategoriArtikel;
    parentKategoris: ParentKategori[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kategori Artikel',
        href: '/kategori-artikels',
    },
    {
        title: 'Edit',
        href: '#', // This will be dynamic based on kategoriArtikel.id
    },
];

export default function KategoriArtikelEdit({ kategoriArtikel, parentKategoris }: KategoriArtikelEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        nama: kategoriArtikel.nama,
        deskripsi: kategoriArtikel.deskripsi || '',
        color_code: kategoriArtikel.color_code || '',
        icon: kategoriArtikel.icon || '',
        parent_id: kategoriArtikel.parent_id === null ? 'null_parent' : kategoriArtikel.parent_id.toString(), // Handle initial null for parent_id
        sort_order: kategoriArtikel.sort_order === null ? '' : kategoriArtikel.sort_order.toString(), // Handle initial null for sort_order
        is_active: kategoriArtikel.is_active,
    });

    // Update the breadcrumbs to include the current article category name
    const dynamicBreadcrumbs = [
        ...breadcrumbs.slice(0, 2),
        {
            title: `Edit: ${kategoriArtikel.nama}`,
            href: route('kategori-artikels.edit', kategoriArtikel.id),
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert parent_id back to null if it's 'null_parent' before sending
        const formData = { ...data };
        if (formData.parent_id === 'null_parent') {
            formData.parent_id = null;
        } else {
            formData.parent_id = Number(formData.parent_id);
        }
        // Convert sort_order back to null if it's empty string
        if (formData.sort_order === '') {
            formData.sort_order = null;
        } else {
            formData.sort_order = Number(formData.sort_order);
        }

        put(route('kategori-artikels.update', kategoriArtikel.id), formData as any); // Type assertion as useForm expects specific types
    };

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Edit Kategori Artikel: ${kategoriArtikel.nama}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">Edit Kategori Artikel</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Kategori</CardTitle>
                        <CardDescription>Perbarui detail kategori artikel ini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nama">Nama</Label>
                                    <Input
                                        id="nama"
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        className={errors.nama ? 'border-destructive' : ''}
                                    />
                                    {errors.nama && <p className="mt-1 text-sm text-destructive">{errors.nama}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Textarea
                                        id="deskripsi"
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        className={errors.deskripsi ? 'border-destructive' : ''}
                                    />
                                    {errors.deskripsi && <p className="mt-1 text-sm text-destructive">{errors.deskripsi}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="color_code">Kode Warna (Hex)</Label>
                                    <Input
                                        id="color_code"
                                        type="text"
                                        value={data.color_code}
                                        onChange={(e) => setData('color_code', e.target.value)}
                                        className={errors.color_code ? 'border-destructive' : ''}
                                    />
                                    {errors.color_code && <p className="mt-1 text-sm text-destructive">{errors.color_code}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="icon">Ikon (Font Awesome, dll)</Label>
                                    <Input
                                        id="icon"
                                        type="text"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        className={errors.icon ? 'border-destructive' : ''}
                                    />
                                    {errors.icon && <p className="mt-1 text-sm text-destructive">{errors.icon}</p>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="parent_id">Kategori Induk</Label>
                                    <Select
                                        onValueChange={(value) => setData('parent_id', value)} // value is already 'null_parent' or ID string
                                        value={data.parent_id}
                                    >
                                        <SelectTrigger className={errors.parent_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih Kategori Induk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Changed value to 'null_parent' */}
                                            <SelectItem value="null_parent">Tidak Ada</SelectItem>
                                            {parentKategoris.map((kategori) => (
                                                <SelectItem key={kategori.id} value={kategori.id.toString()}>
                                                    {kategori.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.parent_id && <p className="mt-1 text-sm text-destructive">{errors.parent_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="sort_order">Urutan Sortir</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', e.target.value)} // Keep as string, convert before PUT request
                                        className={errors.sort_order ? 'border-destructive' : ''}
                                    />
                                    {errors.sort_order && <p className="mt-1 text-sm text-destructive">{errors.sort_order}</p>}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', Boolean(checked))}
                                    />
                                    <Label htmlFor="is_active">Aktif</Label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 md:col-span-2">
                                <Link href={route('kategori-artikels.show', kategoriArtikel.id)}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Perbarui Kategori
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
