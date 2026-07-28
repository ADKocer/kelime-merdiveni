import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Gizlilik Politikası · Kelime Merdiveni",
  description:
    "Kelime Merdiveni gizlilik politikası: hangi verilerin toplandığı, nasıl kullanıldığı ve KVKK kapsamındaki haklarınız.",
  alternates: { canonical: "https://kelimemerdiveni.com/gizlilik" },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Gizlilik Politikası">
      <p>
        Bu Gizlilik Politikası, <strong>kelimemerdiveni.com</strong> (“Site”,
        “biz”) üzerinden sunulan Kelime Merdiveni oyununda kişisel verilerinizin
        nasıl işlendiğini açıklar. 6698 sayılı Kişisel Verilerin Korunması
        Kanunu (“KVKK”) kapsamında hazırlanmıştır.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">1. Veri sorumlusu</h2>
      <p>
        Veri sorumlusu: <strong>Kelime Merdiveni</strong>
        <br />
        İletişim:{" "}
        <a
          href="mailto:kelimemerdiveni@gmail.com"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          kelimemerdiveni@gmail.com
        </a>
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        2. Toplanan veriler
      </h2>
      <p>Siteyi kullanırken aşağıdaki veriler işlenebilir:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Oyun verileri:</strong> seçtiğiniz kelime yolu, adım sayısı,
          ipucu kullanımı, tamamlanan bulmaca tarihi (tarayıcıda yerel
          depolama ile).
        </li>
        <li>
          <strong>Onur tablosu (isteğe bağlı):</strong> skor kaydı için
          girdiğiniz oyuncu adı, skor, çözüm yolu ve kayıt zamanı (sunucu
          veritabanında).
        </li>
        <li>
          <strong>Teknik tanımlayıcılar:</strong> oyun oturumunu sürdürmek için
          HttpOnly çerezler ve anonim oyuncu kimliği (rastgele üretilmiş
          tanımlayıcı).
        </li>
        <li>
          <strong>Analitik veriler:</strong> Google Analytics aracılığıyla
          sayfa görüntüleme, cihaz türü, tarayıcı, yaklaşık konum ve IP
          adresinin anonimleştirilmiş/özetlenmiş hali.
        </li>
        <li>
          <strong>İletişim:</strong> bize e-posta veya sosyal medya
          kanallarından yazmanız halinde ilettiğiniz içerik ve iletişim
          bilgileriniz.
        </li>
      </ul>
      <p>
        Oyunu yalnızca ziyaret edip skor kaydetmezseniz, adınız sunucuya
        iletilmez; yine de oturum çerezleri ve analitik veriler işlenebilir.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        3. İşleme amaçları
      </h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Oyunun çalıştırılması ve oturumun korunması</li>
        <li>Günlük onur tablosunun yönetimi</li>
        <li>Site performansının ve kullanımının ölçülmesi (Google Analytics)</li>
        <li>Hata giderme, güvenlik ve kötüye kullanımın önlenmesi</li>
        <li>Kullanıcı taleplerine yanıt verilmesi</li>
      </ul>

      <h2 className="text-lg font-semibold text-ladder-text">
        4. Hukuki sebepler
      </h2>
      <p>KVKK md. 5 kapsamında verileriniz şu sebeplere dayanılarak işlenir:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Sözleşmenin ifası / hizmet sunumu:</strong> oyun ve skor
          kaydı hizmetinin sağlanması
        </li>
        <li>
          <strong>Meşru menfaat:</strong> site güvenliği, analitik ve hizmet
          iyileştirme (temel haklarınıza zarar vermemek kaydıyla)
        </li>
        <li>
          <strong>Açık rıza:</strong> zorunlu olmayan analitik çerezler için
          (çerez tercihlerinize göre)
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-ladder-text">
        5. Verilerin aktarımı
      </h2>
      <p>
        Verileriniz hizmet sağlayıcılarımız aracılığıyla işlenebilir. Bunlar
        arasında:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Google Analytics</strong> (Google LLC / Google Ireland) —
          kullanım istatistikleri
        </li>
        <li>
          <strong>Turso / barındırma altyapısı</strong> — onur tablosu skor
          kayıtları
        </li>
        <li>
          <strong>Vercel veya eşdeğer barındırma</strong> — site yayını
        </li>
      </ul>
      <p>
        Bu sağlayıcılar yurt dışında bulunabilir. Aktarım, KVKK md. 9
        hükümlerine uygun şekilde veya ilgili sağlayıcının standart
        sözleşmesel hükümleri çerçevesinde gerçekleşebilir.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">6. Saklama süresi</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Onur tablosu kayıtları: ilgili günlük bulmaca dönemi boyunca ve makul
          arşiv süresi
        </li>
        <li>Oturum çerezleri: en fazla 24 saat</li>
        <li>
          Tarayıcı yerel depolama (seri, ilerleme): siz silene veya tarayıcı
          verilerini temizleyene kadar
        </li>
        <li>
          Google Analytics: Google’ın saklama ayarlarına tabidir (genellikle 2–14
          ay aralığında özetlenmiş veri)
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-ladder-text">7. Haklarınız</h2>
      <p>KVKK md. 11 uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>
          Amacına uygun kullanılıp kullanılmadığını, eksik veya yanlış işlenip
          işlenmediğini öğrenme ve düzeltilmesini isteme
        </li>
        <li>KVKK md. 7 kapsamında silinmesini veya yok edilmesini isteme</li>
        <li>
          Otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya
          çıkmasına itiraz etme
        </li>
        <li>Zarara uğramanız hâlinde tazmin talep etme</li>
      </ul>
      <p>
        Taleplerinizi{" "}
        <a
          href="mailto:kelimemerdiveni@gmail.com"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          kelimemerdiveni@gmail.com
        </a>{" "}
        adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde
        sonuçlandırılır.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">8. Çocuklar</h2>
      <p>
        Site genel kitleye yöneliktir; bilerek 13 yaş altından kişisel veri
        toplamıyoruz. Ebeveyn veya veli iseniz ve çocuğunuza ait veri
        işlendiğini düşünüyorsanız bizimle iletişime geçebilirsiniz.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">9. Güvenlik</h2>
      <p>
        Verilerinizi yetkisiz erişime karşı korumak için HTTPS, HttpOnly
        oturum çerezleri ve erişim kısıtlamaları gibi uygun teknik ve idari
        önlemler uygulanmaktadır.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        10. Politika değişiklikleri
      </h2>
      <p>
        Bu metin güncellenebilir. Önemli değişiklikler sitede yayımlanır.
        Güncel sürüm her zaman bu sayfada yer alır.
      </p>

      <p>
        Çerezler hakkında ayrıntılı bilgi için{" "}
        <Link
          href="/cerezler"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          Çerez Politikası
        </Link>
        sayfasına bakınız.
      </p>
    </LegalPageLayout>
  );
}
