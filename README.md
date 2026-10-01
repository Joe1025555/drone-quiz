# 無人機普通操作證模擬測驗

從 388 題題庫隨機抽出 20 題，每題 5 分，滿分 100 分，限時 30 分鐘。

- 上方 1–20 題號可自由切換，已作答會以實心色標示。
- 答案可在交卷前修改，測驗中不顯示正解。
- 手動交卷或時間到自動交卷後，在同一頁列出所有題目的對錯、你的答案及正解。
- 重新整理可恢復本次進度，倒數仍從原本開始時間計算。關閉頁面後再次開啟，若已逾時會立即交卷。
- 「再抽 20 題」可開始新測驗。每次測驗內不重複抽題，不同測驗可能抽到同一題。
- 支援手機；無須安裝套件或後端服務。
- 頁面上方「完整題庫」可在新分頁閱讀整理好的 Markdown，包含四章共 388 題、正確選項的 ✅ 和每題答案；可跳至章節或下載原始 Markdown。

## 在電腦上開啟

直接用 Chrome 或 Edge 開啟 `site/index.html`，即可開始測驗。

## Push 到 GitHub 並發布

1. 在 GitHub 建立一個空的 **public repository**（免費帳號可使用公開儲存庫的 Pages）。不要勾選自動建立 README。
2. 在這個資料夾的終端機執行以下命令，把範例網址換成自己的儲存庫網址：

```powershell
git init -b main
git add site tests .github README.md .gitignore
git commit -m "Add drone practice quiz"
git remote add origin https://github.com/你的帳號/你的儲存庫.git
git push -u origin main
```

3. 進入儲存庫 **Settings → Pages → Build and deployment → Source**，選擇 **GitHub Actions**。
4. 到 **Actions → Deploy quiz to GitHub Pages → Run workflow**，選 `main` 執行。如果第一次 push 發布失敗，完成步驟 3 後重新執行即可。
5. 等部署成功後，從 **Settings → Pages** 開啟網站。網址通常為 `https://你的帳號.github.io/你的儲存庫/`。

之後每次 push 到 `main`，GitHub Actions 會先跑測試，再把 `site/` 發布到 GitHub Pages。網頁由 GitHub Pages 託管，Actions 負責部署。

部署設定依 [GitHub 官方自訂 Pages 工作流程文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 檔案與驗證

- `site/index.html`、`style.css`、`app.js`：網頁與答題流程。
- `site/questions.js`：由本資料夾 Markdown 匯出的 388 題，保留原章節與題號。
- `site/quiz.js`：抽題、計分及計時規則。
- `site/question-bank.html`、`question-bank.js`：完整 Markdown 題庫閱讀頁。
- `site/markdown-data.js`、`question-bank.md`：整理好的 Markdown 內容與下載檔。更新題庫時需同步更新這兩份檔案及 `questions.js`。
- `.github/workflows/deploy-pages.yml`：只發布 `site/`。
- `tests/quiz.test.cjs`：題庫完整性、抽題不重複、計分、倒數到期測試。安裝 Node.js 後可執行 `node --test tests/quiz.test.cjs`。
- `tests/browser.html`：瀏覽器整合檢查，涵蓋切題、修改答案、恢復進度、交卷、計分及逾時。以允許本機檔案存取的測試瀏覽器開啟；測試使用自己的瀏覽器設定檔，避免影響實際作答進度。

題庫更新日期為民國 115/2/2，答案依原始 Word 題庫答案表。此網站用於練習，分數在瀏覽器本機計算，沒有帳號或伺服器端成績紀錄。
