# Third-Party Notices

Bu proje aşağıdaki üçüncü taraf yazılım ve veri kaynaklarını kullanır.

## Kelime veritabanı

Oyun sözlüğü (`data/worddb.json`), aşağıdaki veri setinden türetilmiştir:

- **Kaynak:** [ahakanacar/turkish-dictionary-dataset-and-statistics](https://github.com/ahakanacar/turkish-dictionary-dataset-and-statistics)
- **Dosya:** `turkish_words_clean.csv`
- **Lisans:** MIT License
- **Telif:** Copyright (c) 2026 a-hakan-acar

```
MIT License

Copyright (c) 2026 a-hakan-acar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

`worddb.json` yeniden üretmek için: `npm run build:worddb`

## Bağımlılıklar

Üretim ve geliştirme bağımlılıklarının lisansları `package-lock.json` içinde belirtilmiştir.
Başlıca bileşenler:

| Paket | Lisans |
|-------|--------|
| [Next.js](https://nextjs.org/) | MIT |
| [React](https://react.dev/) | MIT |
| [Tailwind CSS](https://tailwindcss.com/) | MIT |

Tam bağımlılık listesi için: `npm install` sonrası `node_modules` içindeki ilgili
`LICENSE` dosyalarına bakın.
