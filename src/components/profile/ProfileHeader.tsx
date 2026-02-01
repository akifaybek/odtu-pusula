"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, GraduationCap, Building2, Pencil } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    year?: string | null;
    createdAt: string;
    department?: {
      code: string;
      name: string;
      faculty: string;
    } | null;
  };
}

const yearLabels: Record<string, string> = {
  PREP: "Hazırlık",
  FRESHMAN: "1. Sınıf",
  SOPHOMORE: "2. Sınıf",
  JUNIOR: "3. Sınıf",
  SENIOR: "4. Sınıf",
  MASTERS: "Yüksek Lisans",
  PHD: "Doktora",
};

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Date(user.createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-card rounded-xl border p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar */}
        <Avatar className="w-24 h-24 md:w-32 md:h-32 text-2xl">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl md:text-3xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
            {user.year && (
              <Badge variant="secondary" className="w-fit">
                {yearLabels[user.year] || user.year}
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>

            {user.department && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>
                  {user.department.name} ({user.department.code})
                </span>
              </div>
            )}

            {user.department && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>{user.department.faculty}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Üyelik: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <Link href="/profil/duzenle">
          <Button variant="outline" className="gap-2">
            <Pencil className="w-4 h-4" />
            Profili Düzenle
          </Button>
        </Link>
      </div>
    </div>
  );
}
