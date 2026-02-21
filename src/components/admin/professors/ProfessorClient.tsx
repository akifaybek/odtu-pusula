"use client";

import { useState } from "react";
import { Department } from "@prisma/client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProfessorForm } from "./ProfessorForm";
import { deleteProfessor } from "@/actions/admin/professor-actions";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type ProfessorListItem = {
    id: string;
    name: string;
    title: "PROF_DR" | "ASSOC_PROF_DR" | "ASST_PROF_DR" | "LECTURER" | "RES_ASST";
    departmentId: string;
    email?: string | null;
    image?: string | null;
    department: { code: string };
};

interface ProfessorClientProps {
    initialProfessors: ProfessorListItem[];
    departments: Department[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function ProfessorClient({
    initialProfessors,
    departments,
    pagination,
}: ProfessorClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [editingProfessor, setEditingProfessor] = useState<ProfessorListItem | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    // Search handler with debounce (simplified)
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProfessor(id);
            toast.success("Hoca silindi");
            router.refresh();
        } catch {
            toast.error("Silme işlemi başarısız");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Hoca Yönetimi</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingProfessor(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Hoca Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingProfessor ? "Hoca Düzenle" : "Yeni Hoca Ekle"}
                            </DialogTitle>
                        </DialogHeader>
                        <ProfessorForm
                            initialData={editingProfessor ?? undefined}
                            departments={departments}
                            onSuccess={() => {
                                setIsOpen(false);
                                setEditingProfessor(null);
                                router.refresh();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Hoca ara..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Unvan</TableHead>
                            <TableHead>Bölüm</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialProfessors.map((professor) => (
                            <TableRow key={professor.id}>
                                <TableCell className="font-medium">{professor.name}</TableCell>
                                <TableCell>{professor.title}</TableCell>
                                <TableCell>{professor.department.code}</TableCell>
                                <TableCell>{professor.email || "-"}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setEditingProfessor(professor);
                                            setIsOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Bu işlem geri alınamaz. Bu hocayı silmek istediğinize emin misiniz?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(professor.id)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    Sil
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialProfessors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Hoca bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Basic Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", (pagination.page - 1).toString());
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    disabled={pagination.page <= 1}
                >
                    Önceki
                </Button>
                <div className="text-sm">
                    Sayfa {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", (pagination.page + 1).toString());
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    disabled={pagination.page >= pagination.totalPages}
                >
                    Sonraki
                </Button>
            </div>
        </div>
    );
}
