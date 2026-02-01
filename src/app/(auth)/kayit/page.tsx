"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2, Mail, Lock, User, Building, GraduationCap as Grad } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const departments = [
  { code: "CENG", name: "Bilgisayar Mühendisliği" },
  { code: "EE", name: "Elektrik-Elektronik Mühendisliği" },
  { code: "ME", name: "Makine Mühendisliği" },
  { code: "IE", name: "Endüstri Mühendisliği" },
  { code: "CE", name: "İnşaat Mühendisliği" },
  { code: "CHE", name: "Kimya Mühendisliği" },
  { code: "MATH", name: "Matematik" },
  { code: "PHYS", name: "Fizik" },
  { code: "CHEM", name: "Kimya" },
  { code: "STAT", name: "İstatistik" },
  { code: "BA", name: "İşletme" },
  { code: "ECON", name: "Ekonomi" },
  { code: "ARCH", name: "Mimarlık" },
  { code: "ID", name: "Endüstriyel Tasarım" },
  { code: "PSY", name: "Psikoloji" },
];

const years = [
  { value: "PREP", label: "Hazırlık" },
  { value: "FRESHMAN", label: "1. Sınıf" },
  { value: "SOPHOMORE", label: "2. Sınıf" },
  { value: "JUNIOR", label: "3. Sınıf" },
  { value: "SENIOR", label: "4. Sınıf" },
  { value: "MASTERS", label: "Yüksek Lisans" },
  { value: "PHD", label: "Doktora" },
];

const registerSchema = z
  .object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    email: z
      .string()
      .email("Geçerli bir email adresi giriniz")
      .refine(
        (email) => email.endsWith("@metu.edu.tr"),
        "Sadece @metu.edu.tr mail adresleri kabul edilir"
      ),
    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
      .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
    confirmPassword: z.string(),
    department: z.string().min(1, "Bölüm seçiniz"),
    year: z.string().min(1, "Sınıf seçiniz"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function KayitPage() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      year: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          department: data.department,
          year: data.year,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Kayıt sırasında bir hata oluştu");
        return;
      }

      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      router.push("/giris");
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Aramıza Katıl!</CardTitle>
        <CardDescription className="text-gray-500">
          ODTÜ mail adresiniz ile kayıt olun
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Ad Soyad</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Ad Soyad"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="ornek@metu.edu.tr"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Bölüm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Bölüm seç" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.code} - {dept.name}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Sınıf</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Sınıf seç" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Şifre Tekrar</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-[#a41034] hover:bg-[#8a0d2c] rounded-xl h-12 text-base font-medium shadow-lg shadow-[#a41034]/20"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center pb-8">
        <p className="text-sm text-gray-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-[#a41034] hover:underline font-medium">
            Giriş Yap
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
