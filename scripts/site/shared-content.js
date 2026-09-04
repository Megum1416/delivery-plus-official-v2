(() => {
  const contactHtml = `
    <section class="section contact" id="contact">
      <div class="shell contactGrid">
        <div class="contactCopy">
          <span class="kicker">一對一需求評估</span>
          <h2><span>留下店家現況，</span><span>讓專人先了解。</span></h2>
          <p>先告訴我們店家目前的外送狀況，聯絡時就能直接討論適合的做法。</p>
          <div class="contactPoints"><span>✓ 可先完成外送經營健檢</span><span>✓ 專人依需求聯絡</span><span>✓ 簽約前清楚說明報價</span></div>
          <div class="directContact" aria-label="直接聯絡方式">
            <a href="#contact" data-copy-contact aria-label="複製完整聯絡資訊"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>07-262-1216</span><em class="copyStatus" aria-hidden="true">✓ 已複製內容</em></a>
            <a href="#contact" data-copy-contact aria-label="複製完整聯絡資訊"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span>17syn.comp@gmail.com</span><em class="copyStatus" aria-hidden="true">✓ 已複製內容</em></a>
            <a href="https://lin.ee/n89gZhu" target="_blank" rel="noopener"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4.4-1.1L3 20l1.1-4.1A8.3 8.3 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/></svg><span>加入 Line 諮詢</span></a>
            <div class="contactSocials" aria-label="社群連結">
              <a href="https://www.instagram.com/syn.comp" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
              <a href="https://www.facebook.com/profile.php?id=61590428436775" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 10v11M3 10h4v11H3zM7 10l4-7a3 3 0 0 1 3 3v3h5a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7"/></svg></a>
              <a href="https://www.threads.com/@syn.comp" target="_blank" rel="noopener noreferrer" aria-label="Threads"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg></a>
            </div>
          </div>
        </div>
        <form class="formCard" id="leadForm" aria-label="店家合作諮詢表單">
          <div class="formGrid">
            <div class="field"><label for="store">店家／品牌名稱 <i>*</i></label><input id="store" name="store" autocomplete="organization" required placeholder="例：小巷便當"></div>
            <div class="field"><label for="name">聯絡人姓名 <i>*</i></label><input id="name" name="name" autocomplete="name" required placeholder="請輸入姓名"></div>
            <div class="field"><label for="phone">電話或 LINE <i>*</i></label><input id="phone" name="phone" autocomplete="tel" required placeholder="方便聯絡的方式"></div>
            <div class="field"><label for="location">店家所在地 <i>*</i></label><input id="location" name="location" autocomplete="address-level2" required placeholder="例：高雄市左營區"></div>
            <div class="field"><label for="status">目前外送狀況 <i>*</i></label><select id="status" name="status" required><option value="">請選擇</option><option>尚未申請外送平台</option><option>準備新增外送帳號</option><option>已有帳號，希望改善營運</option><option>舊客戶準備續約</option><option>想評估下一階段合作</option></select></div>
            <div class="field"><label for="monthly">每月外送營業規模 <i>*</i></label><select id="monthly" name="monthly" required><option value="">請選擇</option><option>尚未開始營運</option><option>未滿 5 萬</option><option>5～10 萬</option><option>10 萬以上</option><option>目前不清楚</option></select></div>
            <div class="field full"><label for="contactGoal">目前最想解決的事 <i>*</i></label><select id="contactGoal" name="contact_goal" required><option value="">請選擇</option><option>新帳號申請與上線</option><option>菜單或影像改善</option><option>活動與營運優化</option><option>續約或合作內容評估</option></select></div>
            <div class="field full"><label>想了解的服務（可複選）</label><div class="checks"><div class="check"><input type="checkbox" id="p1" name="services" value="新帳號申請"><label for="p1">新帳號申請</label></div><div class="check"><input type="checkbox" id="p2" name="services" value="菜單建置"><label for="p2">菜單建置</label></div><div class="check"><input type="checkbox" id="p3" name="services" value="拍攝或修圖"><label for="p3">拍攝／修圖</label></div><div class="check"><input type="checkbox" id="p4" name="services" value="活動與廣告"><label for="p4">活動與廣告</label></div><div class="check"><input type="checkbox" id="p5" name="services" value="提升訂單"><label for="p5">提升訂單</label></div><div class="check"><input type="checkbox" id="p6" name="services" value="續約或調整合作"><label for="p6">續約／調整合作</label></div></div></div>
            <div class="field full"><label for="message">其他需求（選填）</label><textarea id="message" name="message" placeholder="可以簡單說明目前遇到的問題"></textarea></div>
            <input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"><input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="utm_term"><input type="hidden" name="utm_content"><input type="hidden" name="gclid">
            <div class="field full formAction"><label class="privacy"><input type="checkbox" required><span>我已閱讀並同意競合智數股份有限公司依<a href="privacy.html" target="_blank" rel="noopener">個人資料蒐集告知與隱私權說明</a>蒐集、處理及利用上述資料。</span></label><button class="button submit" type="submit">送出需求，請專人聯絡　→</button><p class="formMessage" id="formMessage" role="status" aria-live="polite"></p></div>
          </div>
        </form>
      </div>
    </section>`;

  const modalHtml = `
    <div class="successModal" id="successModal" hidden>
      <button class="successBackdrop" type="button" data-modal-close tabindex="-1" aria-label="關閉通知"></button>
      <section class="successDialog" role="dialog" aria-modal="true" aria-labelledby="successTitle" aria-describedby="successDescription" tabindex="-1">
        <button class="successClose" type="button" data-modal-close aria-label="關閉通知">×</button>
        <div class="successHeading"><div class="successMark" aria-hidden="true">✓</div><div><span class="successKicker">謝謝你的留言</span><h2 id="successTitle">資料收到囉！</h2></div></div>
        <p id="successDescription">謝謝你告訴我們店家的狀況，接下來會由專人透過你留下的方式聯絡。</p>
        <div class="successContactDetails" aria-label="聯絡資訊"><div><strong>聯絡電話</strong><span>07-262-1216</span></div><div><strong>Email</strong><span>17syn.comp@gmail.com</span></div></div>
        <div class="successLineArea"><p>想更快聊聊？直接加入官方 LINE。</p><a class="button successLine" href="https://lin.ee/n89gZhu" target="_blank" rel="noopener">加入官方 LINE　→</a></div>
        <button class="successReturn" type="button" data-modal-close>繼續看看服務</button>
      </section>
    </div>`;

  const footerHtml = `
    <footer class="footer">
      <div class="shell"><div class="footerGrid"><div><a class="footerLogo" href="首頁新版提案.html"><img src="../assets/syncompgo-logo.png" alt="外送＋｜外送規劃的專家"></a><p>從帳號申請、菜單與影像，<br>到後續營運，陪你把外送經營做好。</p></div><div><h3>網站頁面</h3><ul><li><a href="外送經營健檢新版提案.html" data-page-link="health_check">外送經營健檢</a></li><li><a href="服務方案新版提案.html">服務方案</a></li><li><a href="實際案例新版提案.html">實際案例</a></li><li><a href="常見QA新版提案.html" data-page-link="knowledge">常見 QA</a></li></ul></div><div><h3>公司資訊</h3><ul><li>競合智數股份有限公司</li><li><a href="tel:072621216">07-262-1216</a></li><li><a href="mailto:17syn.comp@gmail.com">17syn.comp@gmail.com</a></li></ul></div></div><div class="footerBottom"><span>© 2026 競合智數股份有限公司</span><a href="privacy.html">隱私權說明</a></div></div>
    </footer>
    <a class="floatLine" href="https://lin.ee/n89gZhu" target="_blank" rel="noopener">LINE 諮詢</a>`;

  window.mountSharedSections = ({ currentPage } = {}) => {
    const contactMount = document.querySelector("#contactMount");
    const modalMount = document.querySelector("#modalMount");
    const footerMount = document.querySelector("#footerMount");
    if (!contactMount || !modalMount || !footerMount) {
      throw new Error("共用區塊安裝位置不完整");
    }

    contactMount.innerHTML = contactHtml;
    modalMount.innerHTML = modalHtml;
    footerMount.innerHTML = footerHtml;

    const currentLink = footerMount.querySelector(`[data-page-link="${currentPage}"]`);
    if (currentLink) currentLink.setAttribute("href", "#top");
  };
})();
