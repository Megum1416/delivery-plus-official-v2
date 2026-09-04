# GitHub Pages 主管預覽說明

本 repo 只維護一份正式網站內容。

- repo 內的五個新版 HTML：已加入正式網域使用的頁面標題、搜尋說明、分享預覽、正式網址與網站名稱設定，供 RD 上架正式網域。
- GitHub Pages：由 `.github/workflows/preview-pages.yml` 自動建立暫時預覽檔。
- 預覽檔的每個 HTML 都會自動加入 `noindex, nofollow`，不會污染正式原始檔。
- 預覽檔會將分享圖片網址改為 GitHub Pages 內的同一份素材，讓主管分享預覽時也能讀到圖片。
- GitHub Pages 網址仍屬公開網址，知道連結的人都能開啟；禁止搜尋不等於密碼保護。

## 預覽首頁

發布流程會將 `首頁新版提案.html` 同時輸出為 GitHub Pages 的 `index.html`，因此打開 Pages 根網址即可看到新版首頁。五個新版頁面的頁首選單皆有「首頁」。

## 正式上線

RD 應直接使用 repo 原始檔，不要使用 Actions 產生的 `.pages-preview` 暫存內容。正式網站不會包含預覽用的 `noindex`。

正式網址對應如下：

- 首頁：`https://syncompgo.com/`
- 服務方案：`https://syncompgo.com/uber-eats-plan`
- 實際案例：`https://syncompgo.com/results`
- 常見 QA：`https://syncompgo.com/knowledge`
- 外送經營健檢：`https://syncompgo.com/delivery-tools`

正式上線後，RD 需確認伺服器會將上述網址對應到五個新版頁面，再提交 Google Search Console。GitHub Pages 主管預覽仍會由發布流程自動改成 `noindex, nofollow`。
