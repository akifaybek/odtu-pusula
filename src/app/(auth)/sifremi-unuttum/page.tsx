"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir email adresi giriniz")
    .refine(
      (email) => email.endsWith("@metu.edu.tr"),
      "Sadece @metu.edu.tr mail adresleri kabul edilir"
    ),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function SifremiUnuttumPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error);
        return;
      }

      setSubmittedEmail(data.email);
      setIsSuccess(true);
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
            Link Gönderildi!
          </CardTitle>
          <CardDescription className="text-gray-500">
            Şifre sıfırlama linki gönderildi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Eğer <span className="font-medium text-gray-900">{submittedEmail}</span> adresi
              sistemimizde kayıtlıysa, şifre sıfırlama linki içeren bir email gönderildi.
            </p>
            <p className="text-sm text-gray-500">
              Email&apos;inizi kontrol edin. Spam klasörünü de kontrol etmeyi unutmayın.
              Link 1 saat geçerlidir.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
          >
            Farklı bir email dene
          </Button>
          <Link href="/giris" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-[#a41034]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Giriş sayfasına dön
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
          Şifremi Unuttum
        </CardTitle>
        <CardDescription className="text-gray-500">
          Email adresinizi girin, size şifre sıfırlama linki gönderelim
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034] focus:ring-[#a41034]/20"
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
                  Gönderiliyor...
                </>
              ) : (
                "Sıfırlama Linki Gönder"
              )}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-xs text-center text-gray-400">
          15 dakika içinde en fazla 3 deneme yapabilirsiniz
        </p>
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
