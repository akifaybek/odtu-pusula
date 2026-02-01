import { ChatBox } from "@/components/chat/ChatBox";

export default function AsistanPage() {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">ODTÜ Pusula Asistan</h1>
        <p className="text-muted-foreground">
          Yapay zeka destekli asistanımız ders seçimi, hocalar ve kampüs hayatı
          hakkında sorularını yanıtlıyor.
        </p>
      </div>

      <ChatBox />
    </div>
  );
}
