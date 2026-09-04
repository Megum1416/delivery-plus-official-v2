# GitHub Pages 主管預覽說明

本 repo 只維護一份正式網站內容。

- repo 內的五個主要頁面與隱私權頁：已加入正式網域使用的頁面標題、搜尋說明、分享預覽、正式網址與網站名稱設定，供 RD 上架正式網域。
- GitHub Pages：由 `.github/workflows/preview-pages.yml` 自動建立暫時預覽檔。
- 預覽檔的每個 HTML 都會自動加入 `noindex, nofollow`，不會污染正式原始檔。
- 預覽檔會將分享圖片網址改為 GitHub Pages 內的同一份素材，讓主管分享預覽時也能讀到圖片。
- GitHub Pages 網址仍屬公開網址，知道連結的人都能開啟；禁止搜尋不等於密碼保護。
- Google Tag Manager 只會在正式網域 `syncompgo.com` 或 `www.syncompgo.com` 載入；GitHub Pages 預覽不會送出正式追蹤或 Google Ads 轉換。

## 預覽首頁

發布流程會將 `首頁新版提案.html` 同時輸出為 GitHub Pages 的 `index.html`，因此打開 Pages 根網址即可看到新版首頁。五個主要頁面的頁首選單皆有「首頁」。

預覽發布只包含下列正式內容，不會公開舊版與展示用頁面：

- `首頁新版提案.html`
- `服務方案新版提案.html`
- `實際案例新版提案.html`
- `常見QA新版提案.html`
- `外送經營健檢新版提案.html`
- `privacy.html`

`qa-data.js` 是新版常見 QA 的題庫，`shared-content.js` 是常見 QA 與外送經營健檢共用的表單、送出成功視窗及頁尾。這兩個檔案都屬正式網站必要檔案。

## 正式上線

RD 應直接使用 repo 原始檔，不要使用 Actions 產生的 `.pages-preview` 暫存內容。正式網站不會包含預覽用的 `noindex`。

建議由 GitHub Actions 手動執行「建立正式上線包（不會發布網站）」，下載產生的 `delivery-plus-production-...`。這份下載檔與主管預覽分開，不會出現在 GitHub Pages 網站上；完整操作請先看 [README.md](README.md)。

正式網址對應如下：

- 首頁：`https://syncompgo.com/`
- 服務方案：`https://syncompgo.com/uber-eats-plan`
- 實際案例：`https://syncompgo.com/results`
- 常見 QA：`https://syncompgo.com/knowledge`
- 外送經營健檢：`https://syncompgo.com/delivery-tools`
- 隱私權說明：`https://syncompgo.com/privacy`

正式上線後，RD 需確認伺服器會將上述網址對應到六個正式頁面，再提交 Google Search Console。GitHub Pages 主管預覽仍會由發布流程自動改成 `noindex, nofollow`。

## 不要發布的舊檔案

下列檔案只保留作歷史參考，不屬正式網站，也不會由 GitHub Pages 預覽流程發布：

- `外送加-官網改版展示.html`
- `delivery-tools.html`
- `uber-eats-plan.html`
- `results.html`
- `knowledge.html`
