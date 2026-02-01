import { Loader2 } from "lucide-react";

export default function MainLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    </div>
  );
}
