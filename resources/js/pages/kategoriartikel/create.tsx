import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ParentKategori {
    id: number;
    nama: string;
}

interface KategoriArtikelCreateProps {
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
        title: 'Tambah',
        href: '/kategori-artikels/create',
    },
];

export default function KategoriArtikelCreate({ parentKategoris }: KategoriArtikelCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        deskripsi: '',
        color_code: '',
        icon: '',
        parent_id: null as number | null, // Initialize as null or number
        sort_order: null as number | null, // Initialize as null or number
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('kategori-artikels.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Kategori Artikel" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">Tambah Kategori Artikel</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Kategori Baru</CardTitle>
                        <CardDescription>Isi detail untuk kategori artikel baru.</CardDescription>
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
                                    {errors.nama && <p className="text-destructive text-sm mt-1">{errors.nama}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Textarea
                                        id="deskripsi"
                                        value={data.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                        className={errors.deskripsi ? 'border-destructive' : ''}
                                    />
                                    {errors.deskripsi && <p className="text-destructive text-sm mt-1">{errors.deskripsi}</p>}
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
                                    {errors.color_code && <p className="text-destructive text-sm mt-1">{errors.color_code}</p>}
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
                                    {errors.icon && <p className="text-destructive text-sm mt-1">{errors.icon}</p>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="parent_id">Kategori Induk</Label>
                                    <Select
                                        onValueChange={(value) => setData('parent_id', value === 'null_parent' ? null : Number(value))}
                                        value={data.parent_id === null ? 'null_parent' : data.parent_id.toString()}
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
                                    {errors.parent_id && <p className="text-destructive text-sm mt-1">{errors.parent_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="sort_order">Urutan Sortir</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order ?? ''} // Use nullish coalescing to display empty string if null
                                        onChange={(e) => setData('sort_order', e.target.value === '' ? null : Number(e.target.value))}
                                        className={errors.sort_order ? 'border-destructive' : ''}
                                    />
                                    {errors.sort_order && <p className="text-destructive text-sm mt-1">{errors.sort_order}</p>}
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
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <Link href={route('kategori-artikels.index')}>
                                    <Button type="button" variant="outline">Batal</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>Simpan Kategori</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
