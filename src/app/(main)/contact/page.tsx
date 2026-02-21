"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Github, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { locale } = useTranslation();
  const language = locale;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {language === "tr" ? "İletişim" : "Contact"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === "tr"
            ? "Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçebilirsiniz."
            : "You can contact us for your questions, suggestions, or feedback."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {language === "tr" ? "Email" : "Email"}
            </CardTitle>
            <CardDescription>
              {language === "tr"
                ? "Genel sorularınız için"
                : "For general inquiries"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:odtupusula@gmail.com"
              className="text-primary hover:underline font-medium"
            >
              odtupusula@gmail.com
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              {language === "tr"
                ? "Genellikle 24-48 saat içinde yanıt veriyoruz."
                : "We typically respond within 24-48 hours."}
            </p>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              {language === "tr" ? "Geri Bildirim" : "Feedback"}
            </CardTitle>
            <CardDescription>
              {language === "tr"
                ? "Öneri ve şikayetleriniz"
                : "Suggestions and complaints"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Platform hakkında öneri veya şikayetlerinizi email yoluyla iletebilirsiniz. Her geri bildirim platformu geliştirmemize yardımcı olur."
                : "You can send your suggestions or complaints about the platform via email. Every feedback helps us improve the platform."}
            </p>
          </CardContent>
        </Card>

        {/* Report Issue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {language === "tr" ? "Sorun Bildirin" : "Report an Issue"}
            </CardTitle>
            <CardDescription>
              {language === "tr"
                ? "Teknik sorunlar veya hatalı içerikler"
                : "Technical issues or inappropriate content"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Uygunsuz içerik, hatalı bilgi veya teknik sorunlar için bize ulaşın. Şikayet edilen içerikler en kısa sürede değerlendirilir."
                : "Contact us for inappropriate content, incorrect information, or technical issues. Reported content is reviewed as soon as possible."}
            </p>
          </CardContent>
        </Card>

        {/* GitHub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              {language === "tr" ? "Katkıda Bulunun" : "Contribute"}
            </CardTitle>
            <CardDescription>
              {language === "tr"
                ? "Açık kaynak geliştirme"
                : "Open source development"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "ODTÜ Pusula açık kaynak bir projedir. Geliştirmeye katkıda bulunmak isterseniz GitHub üzerinden ulaşabilirsiniz."
                : "ODTÜ Pusula is an open source project. If you want to contribute to development, you can reach us on GitHub."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "tr" ? "Sık Sorulan Sorular" : "Frequently Asked Questions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">
              {language === "tr"
                ? "Değerlendirmem neden silinmiş olabilir?"
                : "Why might my review have been deleted?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Hakaret, küfür, kişisel saldırı veya spam içeren değerlendirmeler kaldırılır. Yapıcı eleştiri ve dürüst geri bildirim her zaman kabul edilir."
                : "Reviews containing insults, profanity, personal attacks, or spam are removed. Constructive criticism and honest feedback are always welcome."}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">
              {language === "tr"
                ? "Kimliğim hocalara gösterilir mi?"
                : "Is my identity shown to professors?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Hayır, değerlendirmeleriniz tamamen anonim olarak yayınlanır. Kimliğiniz asla hocalara veya diğer öğrencilere gösterilmez."
                : "No, your reviews are published completely anonymously. Your identity is never shown to professors or other students."}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">
              {language === "tr"
                ? "Yeni bir ders veya hoca nasıl ekletebilirim?"
                : "How can I request a new course or professor to be added?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Veritabanımızda olmayan bir ders veya hoca varsa, email ile bize bildirin. En kısa sürede eklemeye çalışırız."
                : "If there's a course or professor not in our database, let us know via email. We'll try to add it as soon as possible."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
