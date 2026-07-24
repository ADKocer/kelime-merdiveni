# Kelime Merdiveni

Türkçe kelime merdiveni oyunu. Her gün yeni bir görev ve günlük sıralama vardır.

## Kurallar

- Her adımda yalnızca **1 harf** değiştirilebilir
- Kelime uzunluğu sabit kalır (4 harf)
- Tüm kelimeler **oyun sözlüğünde** geçerli olmalıdır
- **Ek eklenerek türetilmiş** kelimeler kabul edilmez
- En az adımda bitirenler günlük leaderboard'da üstte yer alır

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

`data/worddb.json` repoda mevcut olduğu için ekstra adım gerekmez. Kelime listesini yenilemek için:

```bash
npm run build:worddb
```

## Kelime veritabanı

Oyun çalışırken **harici bir sözlük servisine bağlanmaz**. Tüm kelimeler `data/worddb.json` dosyasından okunur.

Kaynak veri seti (MIT lisanslı):

- [ahakanacar/turkish-dictionary-dataset-and-statistics](https://github.com/ahakanacar/turkish-dictionary-dataset-and-statistics)
- Dosya: `turkish_words_clean.csv`

Bu script 4 harfli kelimeleri ayıklar, komşuluk haritası ve günlük görev havuzunu üretir.

## Lisanslar

- **Proje kodu:** [MIT](LICENSE)
- **Üçüncü taraf kaynaklar ve kelime veri seti atfı:** [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

Kelime listesi MIT lisanslı bir veri setinden türetilir; dağıtırken kaynak atfı ve lisans
metninin korunması gerekir.

Yayına alırken `.env` içinde güçlü bir `GAME_SESSION_SECRET` tanımlayın (örnek: `.env.example`).

**Ücretsiz yayın (Vercel + Turso + Natro):** adım adım rehber → [YAYIN.md](YAYIN.md)

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run build:worddb` | GitHub veri setinden `worddb.json` oluşturur |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm start` | Production sunucusu |

## Teknoloji

- **Next.js 15** (App Router)
- **JSON kelime veritabanı** (`data/worddb.json`)
- **JSON skor tablosu** (`data/leaderboard.json`, gitignore)
