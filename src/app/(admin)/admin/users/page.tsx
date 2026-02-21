"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  User,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  isBanned: boolean;
  emailVerified: string | null;
  createdAt: string;
  _count: {
    courseReviews: number;
    professorReviews: number;
  };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [actionType, setActionType] = useState<"ban" | "unban" | "role" | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Users fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanToggle = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: selectedUser.isBanned ? "unban" : "ban",
        }),
      });

      if (res.ok) {
        toast.success(selectedUser.isBanned ? "Kullanıcı ban kaldırıldı" : "Kullanıcı banlandı");
        fetchUsers();
        setSelectedUser(null);
        setActionType(null);
      } else {
        const error = await res.json();
        toast.error(error.error || "İşlem başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "role",
          role: newRole,
        }),
      });

      if (res.ok) {
        toast.success("Kullanıcı rolü güncellendi");
        fetchUsers();
        setSelectedUser(null);
        setActionType(null);
        setNewRole("");
      } else {
        const error = await res.json();
        toast.error(error.error || "İşlem başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      case "MODERATOR":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Shield className="h-3 w-3 mr-1" />
            Moderatör
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <User className="h-3 w-3 mr-1" />
            Kullanıcı
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        <p className="text-muted-foreground mt-1">
          Tüm kullanıcıları görüntüle ve yönet
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İsim veya email ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="USER">Kullanıcı</SelectItem>
                <SelectItem value="MODERATOR">Moderatör</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Email Doğrulama</TableHead>
                <TableHead>Değerlendirmeler</TableHead>
                <TableHead>Kayıt Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Doğrulanmış
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Mail className="h-3 w-3 mr-1" />
                          Beklemede
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user._count.courseReviews + user._count.professorReviews} değerlendirme
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive">
                          <Ban className="h-3 w-3 mr-1" />
                          Banlı
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {session?.user.role === "ADMIN" && user.id !== session.user.id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role);
                                setActionType("role");
                              }}
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Rol
                            </Button>
                            <Button
                              variant={user.isBanned ? "outline" : "destructive"}
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType(user.isBanned ? "unban" : "ban");
                              }}
                            >
                              <Ban className="h-3 w-3 mr-1" />
                              {user.isBanned ? "Unban" : "Ban"}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ban/Unban Dialog */}
      <Dialog
        open={actionType === "ban" || actionType === "unban"}
        onOpenChange={() => {
          setActionType(null);
          setSelectedUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "ban" ? "Kullanıcıyı Banla" : "Ban'ı Kaldır"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "ban"
                ? `${selectedUser?.name} adlı kullanıcıyı banlamak istediğinize emin misiniz? Kullanıcı siteye giriş yapamayacak.`
                : `${selectedUser?.name} adlı kullanıcının ban'ını kaldırmak istediğinize emin misiniz?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedUser(null);
              }}
            >
              İptal
            </Button>
            <Button
              variant={actionType === "ban" ? "destructive" : "default"}
              onClick={handleBanToggle}
              disabled={actionLoading}
            >
              {actionLoading ? "İşleniyor..." : actionType === "ban" ? "Banla" : "Unban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog
        open={actionType === "role"}
        onOpenChange={() => {
          setActionType(null);
          setSelectedUser(null);
          setNewRole("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Rolünü Değiştir</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} adlı kullanıcının rolünü seçin
            </DialogDescription>
          </DialogHeader>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger>
              <SelectValue placeholder="Rol seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">Kullanıcı</SelectItem>
              <SelectItem value="MODERATOR">Moderatör</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setSelectedUser(null);
                setNewRole("");
              }}
            >
              İptal
            </Button>
            <Button onClick={handleRoleChange} disabled={actionLoading || !newRole}>
              {actionLoading ? "İşleniyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
