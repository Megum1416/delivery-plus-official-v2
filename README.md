# 外送＋新版官網

這個 repo 是新版官網唯一的原始版本。

- 主管預覽：[https://megum1416.github.io/delivery-plus-official-v2/](https://megum1416.github.io/delivery-plus-official-v2/)
- 正式網域：`https://syncompgo.com/`
- GitHub Pages 只供預覽，已自動加入禁止搜尋設定。
- 正式上線請使用下方產生的乾淨上線包，不要把整個 repo 直接上傳。

## RD 如何取得正式上線包

1. 打開 GitHub repo 的 **Actions**。
2. 選擇「**建立正式上線包（不會發布網站）**」。
3. 按下 **Run workflow**。
4. 等流程完成後，從該次執行頁面的 **Artifacts** 下載 `delivery-plus-production-...`。
5. 解壓縮後，將裡面的檔案與資料夾完整上傳到正式網站根目錄。

這個流程只建立下載檔，不會修改 GitHub Pages，也不會自動發布正式網站。下載檔若過期，重新執行一次即可；不會影響已上架的網站或表單收件。

## 正式網址

| 頁面 | 正式網址 | 上線包位置 |
| --- | --- | --- |
| 首頁 | `/` | `index.html` |
| 服務方案 | `/uber-eats-plan` | `uber-eats-plan/index.html` |
| 實際案例 | `/results` | `results/index.html` |
| 常見 QA | `/knowledge` | `knowledge/index.html` |
| 外送經營健檢 | `/delivery-tools` | `delivery-tools/index.html` |
| 隱私權說明 | `/privacy` | `privacy/index.html` |

若正式主機不能自動讀取各資料夾內的 `index.html`，RD 需要依上表設定網址對應。

## 不要發布的舊檔案

下列檔案只留在 repo 作歷史參考，正式上線包不會包含：

- `外送加-官網改版展示.html`
- `delivery-tools.html`
- `uber-eats-plan.html`
- `results.html`
- `knowledge.html`
- `knowledge.js`
- `knowledge-base.css`
- `site-optimizations.js`
- `site-optimizations.css`

## RD 上架後必須驗證

1. 開啟上表六個正式網址，確認頁面、圖片與頁首導覽正常。
2. 從正式網域送出一筆清楚標示為測試的諮詢資料，確認 Google 試算表新增一列。
3. 確認成功視窗只在試算表收件成功後出現。
4. 使用 Google Tag Assistant 確認 `lead_form_submit_success` 成功觸發一次。
5. 確認 `robots.txt` 與 `sitemap.xml` 可以開啟，再提交 Google Search Console。

## 目前狀態

- 網站程式、SEO／GEO、分享預覽、隱私權、Google Sheet 表單接收、GTM 與 Google Ads 轉換程式已完成。
- 常見 QA 共 100 題，其中 10 題已有逐題固定回答；其餘 90 題仍需內容負責人逐題確認後再正式公告。
- 正式網域上的表單收件、網址與廣告轉換，必須等 RD 上架後做最後驗證。

## 詳細交接文件

- [GitHub Pages 預覽與正式網址](GITHUB_PAGES_PREVIEW.md)
- [表單、Google Sheet、GTM 與 Google Ads](網站操作紀錄交接.md)
- [SEO 與 GEO 設定](SEO與GEO設定交接.md)
- [各頁按鈕導向](按鈕導向紀錄.md)
