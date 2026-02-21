"use client";

import { useTranslation } from "@/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Lock, Users, Info, AlertTriangle, Database, Scale, Mail } from "lucide-react";

export default function LegalPage() {
  const { locale } = useTranslation();
  const language = locale;
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "privacy" ? "privacy" : "terms";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {language === "tr" ? "Yasal Bilgiler" : "Legal Information"}
        </h1>
        <p className="text-muted-foreground">
          {language === "tr"
            ? "ODTÜ Pusula Kullanım Şartları ve Gizlilik Politikası"
            : "Terms of Use and Privacy Policy for ODTÜ Pusula"}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {language === "tr" ? "Kullanım Şartları" : "Terms of Use"}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {language === "tr" ? "Kullanım Şartları" : "Terms of Use"}
              </CardTitle>
              <CardDescription>
                {language === "tr" ? "Son güncelleme: Şubat 2025" : "Last updated: February 2025"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section 1 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  {language === "tr" ? "1. Üyelik Koşulları" : "1. Membership Eligibility"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "ODTÜ Pusula, Orta Doğu Teknik Üniversitesi (ODTÜ) topluluğuna özel bir platformdur. Platforma yalnızca geçerli bir @metu.edu.tr email adresi ile kayıt olunabilir. Bu kısıtlamayı aşmaya yönelik girişimler hesabın derhal kapatılmasına neden olabilir."
                    : "ODTÜ Pusula is an exclusive platform for the Middle East Technical University (METU/ODTÜ) community. Only users with a valid @metu.edu.tr email address are permitted to register. Attempts to circumvent this restriction may result in immediate account termination."}
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-500" />
                  {language === "tr" ? "2. Kullanıcı Davranışı ve Moderasyon" : "2. User Conduct & Moderation"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Açık ve dürüst geri bildirimi teşvik ediyoruz. Ancak aşağıdaki içerikler kesinlikle yasaktır:"
                    : "We encourage open and honest feedback. However, the following content is strictly prohibited:"}
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>{language === "tr" ? "Nefret söylemi, taciz veya tehdit." : "Hate speech, harassment, or threats."}</li>
                  <li>{language === "tr" ? "Hakaret, küfür veya kişisel saldırı." : "Insults, profanity, or personal attacks."}</li>
                  <li>{language === "tr" ? "İtibar zedelemeye yönelik yanlış bilgi." : "False information intended to damage reputation."}</li>
                  <li>{language === "tr" ? "Spam veya reklam içeriği." : "Spam or promotional content."}</li>
                  <li>{language === "tr" ? "Kişisel bilgi paylaşımı (telefon, adres vb.)." : "Sharing personal information (phone, address, etc.)."}</li>
                </ul>
                <div className="bg-muted p-4 rounded-lg border border-border/50 mt-3">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {language === "tr" ? "Moderasyon Hakları:" : "Moderation Rights:"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "tr"
                      ? "Yönetim, bu kuralları ihlal eden içerikleri önceden haber vermeksizin kaldırma hakkını saklı tutar. Tekrarlayan ihlaller hesabın askıya alınmasına veya kalıcı olarak kapatılmasına neden olabilir."
                      : "The administration reserves the right to remove any content that violates these rules without prior notice. Repeat violations may result in account suspension or permanent termination."}
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  {language === "tr" ? "3. Sorumluluk Reddi" : "3. Disclaimer of Liability"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Bu platformda yer alan değerlendirmeler ve görüşler bireysel öğrencilere aittir ve Orta Doğu Teknik Üniversitesi'nin veya platform yöneticilerinin resmi tutumunu yansıtmaz. Hiçbir değerlendirmenin doğruluğunu garanti etmiyoruz. Kullanıcılar, platformdaki bilgileri kendi sorumluluklarında kullanır."
                    : "The reviews and opinions expressed on this platform are those of individual students and do not reflect the official stance of Middle East Technical University or the platform administrators. We do not guarantee the accuracy of any review. Users use the information on the platform at their own responsibility."}
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-500" />
                  {language === "tr" ? "4. Fikri Mülkiyet" : "4. Intellectual Property"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Kullanıcılar tarafından paylaşılan değerlendirmeler, kullanıcının mülkiyetinde kalır. Ancak platformda paylaşılan içerikler, platformun hizmet sunumu amacıyla kullanılabilir. Kullanıcılar, içeriklerinin platformda yayınlanmasına izin vermiş sayılır."
                    : "Reviews shared by users remain the property of the user. However, content shared on the platform may be used for the purpose of providing the platform's services. Users are deemed to have consented to the publication of their content on the platform."}
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  {language === "tr" ? "5. İletişim" : "5. Contact"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Bu şartlarla ilgili sorularınız için odtupusula@gmail.com adresinden bizimle iletişime geçebilirsiniz."
                    : "For questions about these terms, you can contact us at odtupusula@gmail.com."}
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-500" />
                {language === "tr" ? "Gizlilik Politikası" : "Privacy Policy"}
              </CardTitle>
              <CardDescription>
                {language === "tr" ? "Verilerinizi nasıl koruyoruz" : "How we protect your data"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section 1 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  {language === "tr" ? "1. Anonimlik" : "1. Anonymity"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Samimi geri bildirimin önemini anlıyoruz. Değerlendirmeleriniz, siz aksini tercih etmedikçe tamamen anonim olarak yayınlanır. Hocalar ve diğer öğrenciler değerlendirmelerinizi 'Anonim Öğrenci' olarak görür. Kimliğiniz asla halka açık şekilde gösterilmez."
                    : "We understand the importance of candid feedback. Your reviews are published completely anonymously unless you choose otherwise. Professors and other students see your review as 'Anonymous Student'. Your identity is never displayed publicly."}
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  {language === "tr" ? "2. Toplanan Veriler" : "2. Data Collection"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Platformu kullanabilmeniz için aşağıdaki verileri toplarız:"
                    : "We collect the following data to enable you to use the platform:"}
                </p>
                <div className="bg-muted p-4 rounded-lg border border-border/50">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {language === "tr" ? "Topladığımız veriler:" : "What we collect:"}
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>{language === "tr" ? "Email adresi (@metu.edu.tr)" : "Email address (@metu.edu.tr)"}</li>
                    <li>{language === "tr" ? "İsim (isteğe bağlı takma ad kullanabilirsiniz)" : "Name (you can optionally use a nickname)"}</li>
                    <li>{language === "tr" ? "Bölüm ve sınıf bilgisi" : "Department and year information"}</li>
                    <li>{language === "tr" ? "Giriş zaman damgaları ve IP adresleri (erişim logları)" : "Login timestamps and IP addresses (access logs)"}</li>
                    <li>{language === "tr" ? "Değerlendirmeleriniz ve beğenileriniz" : "Your reviews and likes"}</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  {language === "tr" ? "3. Veri Güvenliği" : "3. Data Security"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Verileriniz güvenli sunucularda şifrelenmiş olarak saklanır. Şifreleriniz hash algoritmaları ile korunur ve asla düz metin olarak saklanmaz. Yalnızca geçerli bir mahkeme kararı veya resmi yasal talep üzerine yasal makamlarla paylaşılır."
                    : "Your data is stored encrypted on secure servers. Your passwords are protected with hash algorithms and are never stored as plain text. It is only shared with legal authorities upon a valid court order or official legal request."}
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Scale className="h-4 w-4 text-amber-500" />
                  {language === "tr" ? "4. Yasal Uyumluluk" : "4. Legal Compliance"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Türkiye Cumhuriyeti yasalarına (5651 Sayılı Kanun dahil) uygun olarak belirli erişim loglarını tutmak zorundayız. Bu veriler gizli tutulur ve yalnızca yasal zorunluluk halinde yetkili makamlarla paylaşılır."
                    : "We are required to maintain certain access logs in compliance with the laws of the Republic of Turkey (including Law No. 5651). This data is kept confidential and is only shared with authorized authorities when legally required."}
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  {language === "tr" ? "5. Üçüncü Taraf Hizmetler" : "5. Third-Party Services"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Kimlik doğrulama (email doğrulama) ve barındırma için üçüncü taraf hizmetler kullanıyoruz. Bu sağlayıcılar endüstri standardı güvenlik uygulamalarına uymaktadır. Verileriniz asla reklam amaçlı satılmaz veya paylaşılmaz."
                    : "We use third-party services for authentication (email verification) and hosting. These providers adhere to industry-standard security practices. Your data is never sold or shared for advertising purposes."}
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-red-500" />
                  {language === "tr" ? "6. Veri Silme Hakkı" : "6. Right to Delete Data"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === "tr"
                    ? "Hesabınızı ve tüm verilerinizi silmek istiyorsanız, odtupusula@gmail.com adresine email göndererek talepte bulunabilirsiniz. Yasal saklama süreleri hariç olmak üzere, verileriniz 30 gün içinde silinir."
                    : "If you want to delete your account and all your data, you can request it by sending an email to odtupusula@gmail.com. Except for legal retention periods, your data will be deleted within 30 days."}
                </p>
              </section>

              {/* Contact */}
              <section className="space-y-3 pt-4 border-t">
                <h3 className="text-lg font-semibold">
                  {language === "tr" ? "İletişim" : "Contact"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "tr"
                    ? "Gizlilik politikamızla ilgili sorularınız için: "
                    : "For questions about our privacy policy: "}
                  <a href="mailto:odtupusula@gmail.com" className="text-primary hover:underline">
                    odtupusula@gmail.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
