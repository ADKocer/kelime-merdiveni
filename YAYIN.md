# Oyunu ücretsiz yayınlama (Vercel + Turso + Natro)

Bu rehber teknik bilmeyenler için adım adım yazıldı.
Tahmini süre: 20–40 dakika.

---

## 1) Turso hesabı (skor defteri — ücretsiz)

1. Tarayıcıda aç: https://turso.tech  
2. **Sign up** ile üye ol (GitHub ile de olabilir).  
3. Yeni bir database oluştur, isim örneği: `kelime-merdiveni`  
4. Database sayfasında şunları kopyala:
   - **URL** (genelde `libsql://...` ile başlar)
   - **Token** (Auth token / create token)

Bunları bir yere not et. Sonra Vercel’e yapıştıracağız.

---

## 2) Vercel hesabı (oyunun çalışacağı yer — ücretsiz)

1. Aç: https://vercel.com  
2. GitHub ile giriş yap.  
3. Bu proje kodunu önce **GitHub’a** yüklemen gerekir (Vercel GitHub’dan çeker).  
   - Yoksa ben bir sonraki adımda “GitHub’a nasıl koyarız?” diye ayrıca anlatırım.  
4. Vercel’de **Add New Project** → GitHub’daki bu repoyu seç → **Deploy**.

---

## 3) Vercel’e gizli anahtarları ekle

Vercel proje sayfası → **Settings** → **Environment Variables**:

| İsim | Değer |
|------|--------|
| `GAME_SESSION_SECRET` | Uzun rastgele yazı (ör. şifre üreticiden 32+ karakter) |
| `TURSO_DATABASE_URL` | Turso’dan kopyaladığın URL |
| `TURSO_AUTH_TOKEN` | Turso’dan kopyaladığın token |

Environment: **Production** (ve istersen Preview) işaretli olsun.  
Kaydettikten sonra **Redeploy** yap (Deployments → son deploy → Redeploy).

---

## 4) Natro domain’ini Vercel’e bağla

1. Vercel proje → **Settings** → **Domains** → domain’ini yaz (ör. `kelimemerdiveni.com`) → Add.  
2. Vercel sana DNS kayıtları gösterecek (genelde):
   - **A** kaydı veya  
   - **CNAME** kaydı  
3. Natro panel → domain → **DNS Yönetimi** → Vercel’in dediği kayıtları ekle.  
4. Biraz bekle (bazen 5 dk, bazen birkaç saat).  
5. Vercel’de domain yeşil / Valid olunca site açılır.

---

## 5) Test et

1. Telefondan kendi domain’ini aç.  
2. Bir merdiven bitir → skor kaydet.  
3. Onur tablosunda ismini gör.  
4. Sayfayı yenile → skor hâlâ duruyor olmalı.

---

## Yerelde geliştirme

Turso olmadan da çalışır: skorlar geçici olarak `data/local-leaderboard.db` dosyasına yazılır.

Turso ile lokal test için proje klasöründe `.env.local` oluştur:

```
GAME_SESSION_SECRET=gelistirme-icin-bir-anahtar
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Sonra: `npm run dev`

---

## Takılınca

- “TURSO_DATABASE_URL tanımlı değil” → Vercel env eksik / redeploy unutulmuş  
- Domain açılmıyor → DNS henüz yayılmamış veya Natro kaydı yanlış  
- Skor kayboluyor → hâlâ dosya DB’ye bakıyorsan env’ler production’a girmemiş demektir
