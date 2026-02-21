"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createProfessor, updateProfessor } from "@/actions/admin/professor-actions";
import { toast } from "sonner";
import { Department, Title } from "@prisma/client";

const professorSchema = z.object({
    name: z.string().min(3, "İsim en az 3 karakter olmalıdır"),
    title: z.nativeEnum(Title, {
        message: "Geçerli bir unvan seçiniz",
    }),
    departmentId: z.string().min(1, "Bölüm seçilmelidir"),
    email: z.string().email("Geçerli bir email giriniz").optional().or(z.literal("")),
    image: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
});

type ProfessorFormValues = z.infer<typeof professorSchema>;

type ProfessorInitialData = {
    id: string;
    name: string;
    title: Title;
    departmentId: string;
    email?: string | null;
    image?: string | null;
};

interface ProfessorFormProps {
    initialData?: ProfessorInitialData;
    departments: Department[];
    onSuccess: () => void;
}

const titles = [
    { value: Title.PROF_DR, label: "Prof. Dr." },
    { value: Title.ASSOC_PROF_DR, label: "Doç. Dr." },
    { value: Title.ASST_PROF_DR, label: "Dr. Öğr. Üyesi" },
    { value: Title.LECTURER, label: "Öğr. Gör." },
    { value: Title.RES_ASST, label: "Araş. Gör." },
];

export function ProfessorForm({
    initialData,
    departments,
    onSuccess,
}: ProfessorFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<ProfessorFormValues>({
        resolver: zodResolver(professorSchema),
        defaultValues: {
            name: initialData?.name || "",
            title: initialData?.title || Title.PROF_DR,
            departmentId: initialData?.departmentId || "",
            email: initialData?.email || "",
            image: initialData?.image || "",
        },
    });

    const onSubmit = async (data: ProfessorFormValues) => {
        setLoading(true);
        try {
            let result;
            // Clean up empty strings for optional fields
            const cleanedData = {
                ...data,
                email: data.email || undefined,
                image: data.image || undefined,
            };

            if (initialData) {
                result = await updateProfessor(initialData.id, cleanedData);
            } else {
                result = await createProfessor(cleanedData);
            }

            if (result.success) {
                toast.success(
                    initialData ? "Hoca güncellendi" : "Hoca oluşturuldu"
                );
                onSuccess();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ad Soyad</FormLabel>
                            <FormControl>
                                <Input placeholder="Ahmet Yılmaz" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unvan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unvan seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {titles.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bölüm</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Bölüm seçin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name} ({dept.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email (İsteğe bağlı)</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="example@metu.edu.tr" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Profil Resmi URL (İsteğe bağlı)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Güncelle" : "Oluştur"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
