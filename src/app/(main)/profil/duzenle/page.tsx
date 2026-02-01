"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, Lock } from "lucide-react";
import Link from "next/link";

interface Department {
  id: string;
  code: string;
  name: string;
}

const yearOptions = [
  { value: "PREP", label: "Hazırlık" },
  { value: "FRESHMAN", label: "1. Sınıf" },
  { value: "SOPHOMORE", label: "2. Sınıf" },
  { value: "JUNIOR", label: "3. Sınıf" },
  { value: "SENIOR", label: "4. Sınıf" },
  { value: "MASTERS", label: "Yüksek Lisans" },
  { value: "PHD", label: "Doktora" },
];

export default function ProfilDuzenlePage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
      return;
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [profileRes, deptsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/departments"),
      ]);

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setName(profile.name);
        setDepartmentId(profile.department?.id || "");
        setYear(profile.year || "");
      }

      if (deptsRes.ok) {
        const depts = await deptsRes.json();
        setDepartments(depts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      toast.error("İsim en az 2 karakter olmalıdır");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          departmentId: departmentId || null,
          year: year || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Profil güncellenemedi");
      }

      toast.success("Profil güncellendi");
      router.push("/profil");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Tüm şifre alanlarını doldurun");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Şifre değiştirilemedi");
      }

      toast.success("Şifre değiştirildi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/profil"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Profile Dön
      </Link>

      <h1 className="text-3xl font-bold">Profili Düzenle</h1>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">İsim</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınız Soyadınız"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Bölüm</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Bölüm seçin" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Sınıf</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçin" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Kaydet
              </Button>
              <Link href="/profil">
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Şifre Değiştir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              disabled={changingPassword}
              className="gap-2"
            >
              {changingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Şifreyi Değiştir
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
