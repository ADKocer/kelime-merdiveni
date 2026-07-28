import type { Metadata } from "next";
import Link from "next/link";
import { CookiePreferencesReset } from "@/components/CookiePreferencesReset";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Çerez Politikası · Kelime Merdiveni",
  description:
    "Kelime Merdiveni çerez politikası: hangi çerezlerin kullanıldığı ve nasıl yönetileceği.",
  alternates: { canonical: "https://kelimemerdiveni.com/cerezler" },
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Çerez Politikası">
      <p>
        Bu Çerez Politikası, <strong>kelimemerdiveni.com</strong> (“Site”)
        ziyaretiniz sırasında cihazınıza kaydedilen çerezleri ve benzeri
        teknolojileri açıklar. Kişisel verilerinizin genel işlenmesi için{" "}
        <Link
          href="/gizlilik"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          Gizlilik Politikası
        </Link>
        nı inceleyiniz.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">1. Çerez nedir?</h2>
      <p>
        Çerezler, web sitesi tarafından tarayıcınıza kaydedilen küçük metin
        dosyalarıdır. Oturumun sürdürülmesi, tercihlerin hatırlanması ve site
        kullanımının analiz edilmesi gibi amaçlarla kullanılabilir.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        2. Kullandığımız çerezler
      </h2>

      <h3 className="font-medium text-ladder-text">Zorunlu çerezler</h3>
      <p>
        Site’nin temel işlevleri için gereklidir; devre dışı bırakılırsa oyun
        düzgün çalışmayabilir.
      </p>
      <div className="overflow-x-auto rounded-lg border border-ladder-border">
        <table className="w-full min-w-[28rem] text-left text-xs sm:text-sm">
          <thead className="border-b border-ladder-border bg-ladder-bg/80">
            <tr>
              <th className="px-3 py-2 font-medium text-ladder-text">Ad</th>
              <th className="px-3 py-2 font-medium text-ladder-text">Amaç</th>
              <th className="px-3 py-2 font-medium text-ladder-text">Süre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ladder-border/70">
            <tr>
              <td className="px-3 py-2 align-top">km_session</td>
              <td className="px-3 py-2 align-top">
                Oyun oturumu (kelime yolu, ipucu sayısı)
              </td>
              <td className="px-3 py-2 align-top">24 saat</td>
            </tr>
            <tr>
              <td className="px-3 py-2 align-top">km_player</td>
              <td className="px-3 py-2 align-top">
                Anonim oyuncu kimliği (skor ve isim eşleştirmesi)
              </td>
              <td className="px-3 py-2 align-top">1 yıl</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mt-4 font-medium text-ladder-text">Analitik çerezler</h3>
      <p>
        Ziyaretçi sayısı ve site kullanımını anlamamıza yardımcı olur. Bu
        çerezler yalnızca analiz amacıyla kullanılır.
      </p>
      <div className="overflow-x-auto rounded-lg border border-ladder-border">
        <table className="w-full min-w-[28rem] text-left text-xs sm:text-sm">
          <thead className="border-b border-ladder-border bg-ladder-bg/80">
            <tr>
              <th className="px-3 py-2 font-medium text-ladder-text">
                Sağlayıcı
              </th>
              <th className="px-3 py-2 font-medium text-ladder-text">Amaç</th>
              <th className="px-3 py-2 font-medium text-ladder-text">Süre</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2 align-top">Google Analytics (_ga, _ga_*)</td>
              <td className="px-3 py-2 align-top">
                Ziyaret istatistikleri, sayfa görüntüleme
              </td>
              <td className="px-3 py-2 align-top">2 yıla kadar</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs sm:text-sm">
        Google Analytics hakkında:{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          Google Gizlilik Politikası
        </a>
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        3. Yerel depolama (localStorage)
      </h2>
      <p>
        Çerez olmamakla birlikte tarayıcınızda saklanan veriler de
        kullanılmaktadır:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Tamamlanan günler ve seri bilgisi</li>
        <li>Tercih ettiğiniz oyuncu adı (onur tablosu için)</li>
        <li>Tema tercihi (açık/koyu mod)</li>
        <li>Çerez onay tercihi (km_cookie_consent)</li>
      </ul>
      <p>
        Bu veriler yalnızca cihazınızda kalır; tarayıcı verilerini temizleyerek
        silebilirsiniz.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        4. Çerez tercihleri
      </h2>
      <p>
        İlk ziyaretinizde analitik çerezler için onay banner’ı gösterilir.
        Tercihiniz tarayıcınızda <strong>km_cookie_consent</strong> anahtarı
        ile saklanır (<code className="text-ladder-text">all</code> = analitik
        kabul, <code className="text-ladder-text">essential</code> = yalnızca
        zorunlu). Google Analytics yalnızca analitik çerezleri kabul etmeniz
        hâlinde yüklenir.
      </p>
      <p>
        <CookiePreferencesReset />
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">
        5. Çerezleri yönetme
      </h2>
      <p>
        Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.
        Zorunlu çerezlerin engellenmesi oyun oturumunun ve skor kaydının
        çalışmamasına yol açabilir.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Chrome: Ayarlar → Gizlilik ve güvenlik → Çerezler
        </li>
        <li>
          Safari: Tercihler → Gizlilik
        </li>
        <li>
          Firefox: Ayarlar → Gizlilik ve Güvenlik
        </li>
      </ul>
      <p>
        Google Analytics izlemesini sınırlandırmak için{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          Google Analytics Opt-out eklentisi
        </a>{" "}
        kullanılabilir.
      </p>

      <h2 className="text-lg font-semibold text-ladder-text">6. İletişim</h2>
      <p>
        Çerezler veya gizlilik ile ilgili sorularınız için:{" "}
        <a
          href="mailto:kelimemerdiveni@gmail.com"
          className="text-ladder-accent underline-offset-2 hover:underline"
        >
          kelimemerdiveni@gmail.com
        </a>
      </p>
    </LegalPageLayout>
  );
}
