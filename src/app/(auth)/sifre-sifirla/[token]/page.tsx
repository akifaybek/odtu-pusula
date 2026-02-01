"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(100, "Şifre çok uzun"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "En az 6 karakter", test: (p) => p.length >= 6 },
  { label: "En az bir büyük harf", test: (p) => /[A-Z]/.test(p) },
  { label: "En az bir küçük harf", test: (p) => /[a-z]/.test(p) },
  { label: "En az bir rakam", test: (p) => /[0-9]/.test(p) },
];

export default function SifreSifirlaPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchPassword = form.watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error);
        return;
      }

      setIsSuccess(true);
      toast.success("Şifreniz başarıyla güncellendi!");

      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push("/giris");
      }, 3000);
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Şifre Güncellendi!
          </CardTitle>
          <CardDescription className="text-gray-500">
            Şifreniz başarıyla değiştirildi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Yeni şifreniz ile giriş yapabilirsiniz.
              Birkaç saniye içinde giriş sayfasına yönlendirileceksiniz...
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-center pb-8">
          <Link href="/giris" className="w-full">
            <Button className="w-full bg-[#a41034] hover:bg-[#8a0d2c] rounded-xl h-12 text-base font-medium shadow-lg shadow-[#a41034]/20">
              Giriş Yap
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Yeni Şifre Belirle
        </CardTitle>
        <CardDescription className="text-gray-500">
          Hesabınız için yeni bir şifre oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Yeni Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-[#a41034] focus:ring-[#a41034]/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Şifre gereksinimleri */}
            {watchPassword && (
              <div className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Şifre gereksinimleri:
                </p>
                {passwordRequirements.map((req) => {
                  const passed = req.test(watchPassword);
                  return (
                    <div
                      key={req.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      {passed ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-gray-300" />
                      )}
                      <span
                        className={cn(
                          passed ? "text-emerald-600" : "text-gray-400"
                        )}
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Şifre Tekrar
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-[#a41034] focus:ring-[#a41034]/20"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
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
                  Güncelleniyor...
                </>
              ) : (
                "Şifremi Güncelle"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center pb-8">
        <Link
          href="/giris"
          className="text-sm text-gray-500 hover:text-[#a41034] transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Giriş sayfasına dön
        </Link>
      </CardFooter>
    </Card>
  );
}
