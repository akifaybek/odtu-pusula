"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, MessageSquare, Shield, Target, Heart } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { locale } = useTranslation();
  const language = locale;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {language === "tr" ? "ODTÜ Pusula Hakkında" : "About ODTÜ Pusula"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === "tr"
            ? "ODTÜ öğrencileri tarafından, ODTÜ öğrencileri için geliştirilen bağımsız bir ders ve hoca değerlendirme platformu."
            : "An independent course and professor review platform developed by METU students, for METU students."}
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {language === "tr" ? "Misyonumuz" : "Our Mission"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {language === "tr"
              ? "ODTÜ Pusula, öğrencilerin ders seçimi sürecinde bilinçli kararlar vermelerine yardımcı olmak amacıyla kurulmuştur. Platformumuz, gerçek öğrenci deneyimlerini paylaşarak gelecek nesil ODTÜ'lülere rehberlik etmeyi hedefler."
              : "ODTÜ Pusula was founded to help students make informed decisions during course selection. Our platform aims to guide future METU students by sharing real student experiences."}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {language === "tr"
              ? "Ders zorlukları, iş yükü, hocaların öğretim stilleri ve not verme eğilimleri hakkında dürüst ve yapıcı geri bildirimler sunarak, öğrencilerin akademik yolculuklarını daha verimli planlamalarına olanak tanırız."
              : "By providing honest and constructive feedback about course difficulties, workload, teaching styles, and grading tendencies, we enable students to plan their academic journey more effectively."}
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-blue-500" />
              {language === "tr" ? "Ders Değerlendirmeleri" : "Course Reviews"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "1600+ dersin zorluk, iş yükü ve yararlılık değerlendirmelerini inceleyin. Aldığınız notları ve yorumlarınızı paylaşarak diğer öğrencilere yol gösterin."
                : "Explore difficulty, workload, and usefulness ratings for 1600+ courses. Share your grades and comments to guide other students."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-green-500" />
              {language === "tr" ? "Hoca Değerlendirmeleri" : "Professor Reviews"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "2100+ akademisyenin öğretim kalitesi, erişilebilirlik ve not verme eğilimlerini öğrenin. 'Tekrar Alır mıydım?' özelliği ile hızlı kararlar verin."
                : "Learn about teaching quality, accessibility, and grading tendencies of 2100+ academics. Make quick decisions with the 'Would Take Again?' feature."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-purple-500" />
              {language === "tr" ? "Anonimlik Garantisi" : "Anonymity Guarantee"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Değerlendirmeleriniz tamamen anonim olarak yayınlanır. Kimliğiniz asla hocalara veya diğer öğrencilere gösterilmez."
                : "Your reviews are published completely anonymously. Your identity is never shown to professors or other students."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-amber-500" />
              {language === "tr" ? "Topluluk Odaklı" : "Community Driven"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? "Platform, yalnızca @metu.edu.tr email adresi olan ODTÜ öğrencilerine açıktır. Bu sayede güvenilir ve kaliteli içerik sağlanır."
                : "The platform is only open to METU students with @metu.edu.tr email addresses. This ensures reliable and quality content."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{language === "tr" ? "Platform İstatistikleri" : "Platform Statistics"}</CardTitle>
          <CardDescription>
            {language === "tr" ? "Sürekli güncellenen veritabanımız" : "Our continuously updated database"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">
                {language === "tr" ? "Fakülte" : "Faculties"}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">41</div>
              <div className="text-sm text-muted-foreground">
                {language === "tr" ? "Bölüm" : "Departments"}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">1600+</div>
              <div className="text-sm text-muted-foreground">
                {language === "tr" ? "Ders" : "Courses"}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">2100+</div>
              <div className="text-sm text-muted-foreground">
                {language === "tr" ? "Akademisyen" : "Academics"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {language === "tr" ? "Önemli Not" : "Important Note"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {language === "tr"
              ? "ODTÜ Pusula, Orta Doğu Teknik Üniversitesi ile resmi bir bağlantısı olmayan bağımsız bir öğrenci projesidir. Platformdaki değerlendirmeler bireysel öğrenci görüşlerini yansıtır ve üniversitenin resmi tutumunu temsil etmez. Tüm veriler öğrencilerin gönüllü katkılarıyla oluşturulmuştur."
              : "ODTÜ Pusula is an independent student project with no official affiliation with Middle East Technical University. Reviews on the platform reflect individual student opinions and do not represent the official stance of the university. All data is created through voluntary student contributions."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
