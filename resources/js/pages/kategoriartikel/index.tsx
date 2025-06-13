import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PaginatedQueryResult } from '@/types/pagination';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface KategoriArtikel {
    id: number;
    nama: string;
    deskripsi: string | null;
    color_code: string | null;
    icon: string | null;
    parent_id: number | null;
    parent?: KategoriArtikel;
    sort_order: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface KategoriArtikelIndexProps {
    kategoris: PaginatedQueryResult<KategoriArtikel>;
    filters: {
        active: string | null;
        parent: string | null;
    };
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
];

export default function KategoriArtikelIndex() {
    const { kategoris, filters } = usePage<KategoriArtikelIndexProps>().props;
    // Initialize state with 'all' if the filter is null/empty, to match the SelectItem value
    const [filterActive, setFilterActive] = useState(filters.active === null || filters.active === '' ? 'all' : filters.active);
    const [filterParent, setFilterParent] = useState(filters.parent === null || filters.parent === '' ? 'all' : filters.parent);

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('kategori-artikels.index'),
            {
                // Send null or actual value, converting 'all' back
                active: filterActive === 'all' ? null : filterActive,
                parent: filterParent === 'all' ? null : filterParent,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Artikel" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">Daftar Kategori Artikel</h2>
                    <Link href={route('kategori-artikels.create')}>
                        <Button>Tambah Kategori</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Kategori</CardTitle>
                        <CardDescription>Saring daftar kategori artikel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor="filter-active">Status Aktif</Label>
                                <Select onValueChange={setFilterActive} value={filterActive}>
                                    <SelectTrigger id="filter-active">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Changed value to 'all' */}
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="1">Aktif</SelectItem>
                                        <SelectItem value="0">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="filter-parent">Kategori Induk</Label>
                                <Select onValueChange={setFilterParent} value={filterParent}>
                                    <SelectTrigger id="filter-parent">
                                        <SelectValue placeholder="Pilih Status Induk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Changed value to 'all' */}
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="1">Memiliki Induk</SelectItem>
                                        <SelectItem value="0">Tidak Memiliki Induk</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit">Terapkan Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Kategori Artikel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Warna</TableHead>
                                    <TableHead>Ikon</TableHead>
                                    <TableHead>Induk</TableHead>
                                    <TableHead>Status Aktif</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kategoris.data.length > 0 ? (
                                    kategoris.data.map((kategori) => (
                                        <TableRow key={kategori.id}>
                                            <TableCell>{kategori.nama}</TableCell>
                                            <TableCell>{kategori.deskripsi || '-'}</TableCell>
                                            <TableCell style={{ color: kategori.color_code || 'inherit' }}>{kategori.color_code || '-'}</TableCell>
                                            <TableCell>{kategori.icon || '-'}</TableCell>
                                            <TableCell>{kategori.parent?.nama || 'Tidak Ada'}</TableCell>
                                            <TableCell>{kategori.is_active ? 'Aktif' : 'Tidak Aktif'}</TableCell>
                                            <TableCell className="flex gap-2">
                                                <Link href={route('kategori-artikels.show', kategori.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Lihat
                                                    </Button>
                                                </Link>
                                                <Link href={route('kategori-artikels.edit', kategori.id)}>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
                                                            router.delete(route('kategori-artikels.destroy', kategori.id));
                                                        }
                                                    }}
                                                >
                                                    Hapus
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            Tidak ada kategori artikel ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {kategoris.links && (
                            <div className="mt-4 flex justify-center">
                                {kategoris.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`mx-1 rounded px-3 py-1 ${link.active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
