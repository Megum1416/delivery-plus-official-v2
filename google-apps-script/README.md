# 官網表單接收交接

## 正式資源

- Google 試算表：外送＋官網諮詢名單
- 工作表：官網諮詢名單
- Apps Script 專案：外送＋官網表單接收
- 正式接收網址：`https://script.google.com/macros/s/AKfycbwTL76WSgFP5Wzjxuj2gNMhYHRX2bGfYl13avVzi21AWOybF6pvWVGPzvoBZ-HAoeKc/exec`
- 目前正式部署：第 4 版（電話以純文字寫入）

## RD 上線時要保留

1. 網站的 `scripts/site/site-events.js` 已使用上面的正式 `/exec` 網址，不是測試用 `/dev` 網址。
2. 更新 Apps Script 時，請編輯同一個現有部署並建立新版本，不要封存或刪除部署，網址才會維持不變。
3. Apps Script 必須維持「執行身分：fos2022.88@gmail.com」與「誰可以存取：所有人」。
4. 不要把 Google 試算表改成公開；公開的是收件入口，不是名單內容。
5. `Code.gs` 是目前雲端版本的備份。若 RD 改過雲端程式，也要同步更新這份檔案。

## 已驗證

- 首頁、服務方案、實際案例、常見 QA、外送經營健檢皆已各自實際送出成功。
- 試算表會記錄來源頁、完整表單內容、UTM 與 GCLID。
- 手機號碼會以純文字保存，開頭的 `0` 不會遺失。
- 成功視窗只會在接收端回覆成功後出現。
- 本次驗證建立的測試資料已清空，保留標題列。

## 穩定性說明

正式 `/exec` 部署不是一次性授權網址，日常使用不會自行到期。只要 Google 帳號、Apps Script 專案與這個部署沒有被刪除或停用，網站就會繼續使用同一個網址。仍建議正式上線後定期查看 Apps Script 執行紀錄，避免 Google 配額、帳號停權或人為刪除造成漏接。
