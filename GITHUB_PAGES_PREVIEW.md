# GitHub Pages 主管預覽說明

本 repo 只維護一份正式網站內容。

- repo 內的 HTML：供 RD 上架正式網域，之後會補齊正式 SEO 設定。
- GitHub Pages：由 `.github/workflows/preview-pages.yml` 自動建立暫時預覽檔。
- 預覽檔的每個 HTML 都會自動加入 `noindex, nofollow`，不會污染正式原始檔。
- GitHub Pages 網址仍屬公開網址，知道連結的人都能開啟；禁止搜尋不等於密碼保護。

## 預覽首頁

發布流程會將 `首頁新版提案.html` 同時輸出為 GitHub Pages 的 `index.html`，因此打開 Pages 根網址即可看到新版首頁。五個新版頁面的頁首選單皆有「首頁」。

## 正式上線

RD 應直接使用 repo 原始檔，不要使用 Actions 產生的 `.pages-preview` 暫存內容。正式網站不會包含預覽用的 `noindex`。
