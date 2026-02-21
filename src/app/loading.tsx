import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="relative h-12 w-12 animate-spin text-primary" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-lg font-medium text-foreground">Yükleniyor...</p>
          <p className="text-sm text-muted-foreground">ODTÜ Pusula yönünü buluyor</p>
        </div>
      </div>
    </div>
  );
}
