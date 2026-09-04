(() => {
  const library = document.querySelector("#qaLibrary");
  const searchInput = document.querySelector("#qaSearch");
  const searchStatus = document.querySelector("#qaSearchStatus");
  const backButton = document.querySelector("#qaBack");
  const breadcrumb = document.querySelector("#qaBreadcrumb");
  const contactMount = document.querySelector("#contactMount");
  const modalMount = document.querySelector("#modalMount");
  const footerMount = document.querySelector("#footerMount");

  const majorGroups = [
    {
      id: "start",
      step: "01",
      title: "準備開始做外送",
      description: "還在評估適不適合，或準備申請、上架與正式開店。",
      groups: ["platform", "onboarding"],
    },
    {
      id: "growth",
      step: "02",
      title: "日常經營與成長",
      description: "已經開始營運，想釐清費用、訂單、活動與曝光成效。",
      groups: ["fees", "operations", "marketing"],
    },
    {
      id: "partner",
      step: "03",
      title: "評估合作方式",
      description: "想知道外送＋能協助什麼，以及怎麼判斷是否適合合作。",
      groups: ["service", "decision"],
    },
  ];

  const categories = new Map();
  let activeMajor = null;
  let activeGroup = null;

  const fetchDocument = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    const html = await response.text();
    return new DOMParser().parseFromString(html, "text/html");
  };

  const createElement = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const getMajorForGroup = (groupId) => majorGroups.find((major) => major.groups.includes(groupId));

  const publishedAnswers = new Map(
    [...document.querySelectorAll("#answered details")].map((item) => [
      item.querySelector("summary")?.textContent.trim(),
      item.querySelector("p")?.textContent.trim(),
    ]),
  );

  const fallbackAnswers = {
    platform: "不一定每間店都適合做外送。建議先確認品項是否適合配送、尖峰出餐能力，以及扣除平台費用、活動、包材與人力後是否仍有合理毛利，再決定要不要做及開放哪些時段。",
    onboarding: "實際申請條件與設定方式會依平台當時規則、店家類型與帳號狀況不同。先整理店家證明、負責人與收款資料、菜單及營業設定，再逐項確認缺件，比直接猜測更不容易卡關。",
    fees: "這類費用不能只看單一抽成比例，要以目前正式合約與對帳單為準，連同活動分攤、廣告、退款、稅務、包材與人力一起計算單筆實收與毛利。",
    operations: "建議先保留訂單編號、時間、餐點與畫面紀錄，再依問題調整營業時段、備餐時間、品項供應或向平台申訴。若同一問題持續發生，應另外整理成固定處理流程。",
    marketing: "先設定這次活動想改善的目標，再比較活動前後的訂單、客單價、廣告支出與實際毛利。訂單增加不一定等於有賺，沒有達到停損條件就不應持續加碼。",
    service: "外送＋是獨立服務品牌，不是 Uber Eats 官方單位。實際代辦、代管、費用、權限與交付內容，都應在合作前以書面逐項確認，不應只依口頭承諾。",
    decision: "可以先不急著決定。建議把預計投入的費用、人力、合作期間、可交付內容與退出方式整理成一頁，再和家人或合夥人用同一份資料評估。",
  };

  const answerRules = [
    ["platform", /熱吃|現做|糊掉|配送/, "先用實際餐點做一次配送測試，記錄出餐後不同時間的溫度、口感與外觀，再決定哪些品項適合上架。可透過包材、醬料分裝與縮小配送範圍改善；測試後仍明顯失真，就不建議勉強上架。"],
    ["platform", /foodpanda|Uber Direct|網路商店|LINE/, "這些管道解決的事情不同：平台偏向帶來新客與配送，Direct 或自有接單偏向承接既有客人。應比較每個管道的獲客能力、配送安排、操作成本與單筆實收，不需要為了『都有』而全部一起做。"],
    ["platform", /品牌|老字號|廉價/, "上外送不一定會讓品牌變廉價，關鍵是菜單、照片、價格與包裝是否仍維持原本定位。可以只上架適合配送的代表品項，不必把店內整份菜單原樣搬上平台。"],
    ["platform", /巷子|樓上|找不到/, "可先把取餐地址、樓層、入口照片與取餐說明寫清楚，並安排不影響店內動線的取餐位置。若外送員仍常找不到，再檢查平台地圖定位是否正確。"],
    ["platform", /商圈|客群|飽和|太晚/, "不能只用商圈印象判斷。可先看附近平台上的品類、價格帶與競爭密度，再用有限品項和時段測試；重點是能否找到可獲利的需求，不是市場上店家多不多。"],
    ["platform", /忙|多請人|包材/, "如果現場已經滿載，不建議直接全天開放。可以先從離峰時段、少量主打品與明確備餐時間開始，確認不會拖累內用，再決定是否擴大。"],
    ["platform", /優惠|小便宜|價值/, "優惠客是否有價值，要看活動後的實收毛利與是否再次購買，不能只看訂單數。若每筆都虧損、停掉優惠就完全沒有回購，活動就需要調整。"],
    ["onboarding", /公司登記|攤商|酒|生鮮|限制/, "可否申請或上架要依平台目前的店家資格、品項限制與所在地規定確認。先備妥現有登記或許可文件，由平台審核；在確認前不建議先承諾一定能上架。"],
    ["onboarding", /多久|審核|一個多月/, "上線時間會受到資料是否完整、平台審核與補件次數影響，無法保證固定天數。最快的做法是先用清單一次備齊資料，送件後記錄案件進度與每次補件內容。"],
    ["onboarding", /平板|App|設備|印表機/, "先確認平台目前提供或支援的設備，再決定是否需要自行購買。上線前應完成一次接單、拒單、缺品與暫停營業演練，並留下店內可照著做的簡短操作表。"],
    ["onboarding", /自己送|外送員|送壞/, "是否能自送、費用如何計算，以及配送爭議由誰處理，都要看平台目前方案與正式條款。若發生餐損，先保留訂單、出餐照片與時間紀錄，再依平台流程申訴。"],
    ["onboarding", /POS|串|key 單/, "能否串接取決於店內 POS 型號與平台目前支援的整合服務。先提供系統名稱與版本查詢；若不能串接，就要評估人工輸單的錯誤率與尖峰人力是否可負擔。"],
    ["onboarding", /照片|文案|拍照/, "可以先盤點現有照片是否清楚、尺寸是否符合平台需求，再決定補拍或精修。外送＋目前方案可協助菜單與影像，但實際張數和交付內容要依書面方案確認。"],
    ["onboarding", /合約|退出|綁約|罰款/, "合作期間、提前終止與可能費用都應以簽署前拿到的完整合約為準。若條款看不懂，應先要求逐條說明並留存書面版本，不要在未確認退出方式前簽約。"],
    ["onboarding", /兩間分店|各簽|多分店/, "多分店通常要分別確認地址、帳號、菜單與收款設定，但是否分開簽約或計費要看實際合作方案。報價前應先列出所有店點，避免上線後才發現範圍不同。"],
    ["onboarding", /營業時間|晚餐時段/, "可以依店內人力與出餐狀況規劃外送營業時段。建議先從最能穩定出餐的時段開始，並確認平台上的營業時間、休息日與臨時暫停設定都正確。"],
    ["onboarding", /停權|投訴/, "先確認停權通知中的原因、案件編號與申訴入口，備齊平台要求的證明再送出。外送＋可協助整理資料與追蹤，但恢復與否仍由平台決定。"],
    ["onboarding", /多少單|試算/, "可以用商圈、品類、價格與現有營運資料做情境試算，但不能把估算當成保證訂單。比較適合用保守、一般與較佳三種情境，先確認哪一種仍能負擔成本。"],
    ["fees", /方案|選哪一種/, "不要只比較表面費率，應把每個方案的配送方式、平台曝光、固定費、活動負擔與操作人力放在同一張表，再用店家的平均客單與毛利試算。"],
    ["fees", /隱藏費用|固定費用|廣告費|刷卡手續費/, "要求報價時應把所有可能收費逐項列出，包括一次性、固定、依訂單、廣告與活動相關費用。未寫進正式報價或合約的內容，不應只靠口頭理解。"],
    ["fees", /撥款|現金流/, "撥款頻率、結算區間與入帳時間要依店家目前帳號設定及平台報表確認。評估現金流時，要把結算落差與退款調整一起算進去。"],
    ["fees", /對帳單|多扣/, "可依訂單逐筆拆成餐點金額、平台費、活動分攤、退款與其他調整，再核對銀行實際入帳。看不懂時先圈出不明項目，不要只用總額判斷有沒有被多扣。"],
    ["fees", /優惠券|折扣|平台出|Uber One/, "每個活動由誰負擔、負擔比例與適用訂單可能不同，必須看活動設定頁與當期對帳單。參加前先試算折扣後實收，不要假設一定由平台全額補貼。"],
    ["fees", /退款|爭議/, "先查看退款原因、責任歸屬與對帳單調整，再用訂單和出餐紀錄提出申訴。不同情況的負擔方式可能不同，不能一概認定都由店家或平台吸收。"],
    ["fees", /發票|稅務|稅/, "發票與稅務處理會依店家組織、交易流程與平台文件不同。這部分應以會計師或記帳士依實際報表判斷，網站不應直接給固定稅額結論。"],
    ["fees", /抽成|費率|foodpanda|小額訂單|價格調高/, "先以目前正式合約的實際費率，試算每筆訂單扣除平台費、活動、包材與人力後還剩多少。價格是否調整也要一起看客人接受度；不能只靠提高售價解決毛利問題。"],
    ["operations", /尖峰|出不了餐|訂單一多|漏單|平板一直響/, "可先縮短外送營業時段、精簡品項、調整備餐時間，並指定一個接單位置與負責人。若現場仍無法穩定出餐，應先限制單量或暫停，不要讓內用與外送一起失控。"],
    ["operations", /改價|暫停品項|備餐時間/, "是否能自行即時修改要看帳號權限與平台功能。建議先確認誰可以改、變更多久生效，以及缺品時的標準處理方式，避免同一時間多人重複操作。"],
    ["operations", /負評|沒收到|外送員|撒|退款|惡意/, "先保留訂單編號、出餐時間、封裝照片與平台對話，再依個案提出申訴。無法保證一定撤除評價或退款，但完整紀錄能避免只剩雙方口頭說法。"],
    ["operations", /客服|申訴|投訴/, "先把案件編號、發生時間、訂單與畫面整理在同一處，再透過平台可用的支援管道追蹤。若多次未解決，後續聯繫要持續沿用同一案件資訊，避免每次重新說明。"],
    ["operations", /臨時要關店|當機|無法接單/, "遇到臨時關店或系統異常時，先暫停接單並留下錯誤畫面與時間紀錄。重新開店前確認營業狀態和品項供應正常；實際損失處理仍要依平台規則與個案判定。"],
    ["operations", /菜單不一樣|比價/, "店內與外送的份量、包材或服務成本若不同，價格可以分開規劃，但應在菜單上清楚呈現內容差異，避免讓客人以為同一商品只是任意加價。"],
    ["operations", /英文|看不懂|換人|重新教/, "可以把常用操作整理成一頁中文流程，涵蓋接單、缺品、暫停與客訴，並讓新員工實際操作一次。外送＋可協助釐清日常設定，平台帳號問題仍以官方支援為準。"],
    ["marketing", /廣告|預算|保證成效/, "投放前先設定目標、預算上限與停損條件，再比較廣告帶來的訂單與實際毛利。廣告沒有固定最低有效金額，也不能保證成效；重點是小額測試後是否值得繼續。"],
    ["marketing", /買一送一|免運|優惠|折扣|活動|Uber One/, "參加前先確認折扣由誰負擔，並試算活動後每筆實收。活動有意義的前提是能帶來新客、提高回購或清楚改善某個目標，而不是只讓訂單數看起來增加。"],
    ["marketing", /報表|成效|客單價|成功/, "應用同一期間與口徑比較活動前後的訂單、客單價、廣告支出、折扣與實收毛利。若只看營業額或單量，很容易把虧損的成長誤認為成功。"],
    ["marketing", /排名|曝光期|被看到/, "平台曝光通常會受到品類競爭、營業狀態、價格、照片、評分、轉換與活動等多項因素影響，不是只由單一設定決定。可一次調整一項並記錄前後結果。"],
    ["marketing", /虛擬品牌|雲廚房|隔壁店|同業/, "不建議單純跟著低價。先把最有辨識度、配送穩定且毛利合理的品項做好，再用照片、套餐與清楚定位降低只比價格的壓力。"],
    ["marketing", /客人名單|回購/, "平台是否提供顧客資料要依目前隱私規則與商家後台權限為準。可以在規範允許的範圍內，透過包裝、品牌記憶與穩定體驗增加再次搜尋店家的機會。"],
    ["marketing", /評分/, "沒有單一分數能保證曝光。先降低漏品、包裝破損、等待過久與品項落差，並持續看負評原因是否集中在同一問題，比只追求分數更有用。"],
    ["service", /Uber 的人|第三方/, "外送＋不是 Uber Eats 官方單位，而是競合智數股份有限公司旗下的獨立服務品牌。是否值得付費，應看能否補足店家沒有時間或不熟悉的申請、菜單、影像與營運工作。"],
    ["service", /代管|自己也能操作/, "店家當然可以自行操作。代管的價值應是協助整理資料、持續檢查問題並節省店內時間；若實際工作內容、回覆方式與交付成果說不清楚，就不應直接合作。"],
    ["service", /亂開優惠|招牌菜|硬改/, "涉及價格、活動與主要菜單的變更，應先和店家確認，不應為了衝單自行開啟。合作前可把哪些事項需要核准、哪些日常調整可直接執行寫進工作方式。"],
    ["service", /密碼|安全|帳號/, "應採最少必要權限，並記錄誰在什麼時間可操作哪些項目。不要用私人訊息長期傳送主要密碼；實際登入、交接與異常處理方式要在合作前確認。"],
    ["service", /回扣|業績|廣告/, "可要求把服務費、平台費與可能的商業關係分開說明，並以店家的實際毛利作為是否投放的判斷。沒有書面揭露或無法說明原因的推薦，不應直接接受。"],
    ["service", /保證|不付費|效果/, "外送＋不能保證固定訂單或營業額。服務費是否可退、成效不佳如何調整及終止方式，都要依簽約前確認的書面條款處理。"],
    ["service", /簽多久|試一個月|不續約|帶走/, "合作期間、試用、終止方式，以及菜單、照片與設定的使用權，都應在簽約前寫清楚。未確認所有權與交接方式前，不建議只靠口頭承諾。"],
    ["service", /費用怎麼算|固定月費|疊一層/, "外送＋服務費與平台收費是不同項目。目前合作方案為含稅起價，實際服務與付款方式會在簽約前提供書面報價，不應把兩種費用混在一起看。"],
    ["service", /報表|數據|好看的/, "報表應標出資料來源、期間、計算方式與未納入項目，並可回到平台原始資料核對。若只提供結果、不能說明口徑，就不足以作為成效判斷。"],
    ["decision", /家人|合夥人|資料留下|之後再說/, "可以先帶走一份簡單摘要，內容包含目前問題、預計服務、總費用、合作期間與退出方式。等相關人都看過同一份資料後再決定，不需要當下承諾。"],
    ["decision", /淡季|旺季/, "淡季可以先整理菜單、照片、成本與帳號設定，不一定要立刻投入廣告；旺季前再確認是否正式上線。這樣能降低旺季到了才開始補資料的壓力。"],
    ["decision", /被業務騙|相信/, "不要只相信口頭成果或保證。應確認公司資料、書面報價、合約、案例口徑、負責窗口與退出方式；任何無法留下書面紀錄的承諾，都先不要當成合作條件。"],
    ["decision", /年紀|不想學/, "不需要一次學會整個後台。可以先只保留接單、缺品、暫停與聯絡窗口等必要操作，再用一頁圖解和實際演練降低負擔。"],
    ["decision", /多請一個人|人力|找不到/, "若現有人力無法承接，就不建議直接全天開放。可先從少量品項與離峰時段測試；如果仍需要額外人力且毛利無法負擔，暫緩會比硬做合理。"],
    ["decision", /收了|搬|投入不值得/, "先確認預計搬遷或停業時間，再比較短期投入能否回收。若合作期或前置成本超過可營運時間，應選擇較小範圍的準備工作或暫緩。"],
    ["decision", /一樣的店|多賺多少|每個月多付|多賺/, "可以參考店型相近的案例，但商圈、菜單、價格與人力不同，不能直接複製成果。比較合理的是先列出確定費用，再用保守、一般與較佳情境估算，不承諾固定多賺多少。"],
    ["decision", /沒效果|負責|無條件退出/, "應在合作前先定義什麼叫有效、多久檢查一次，以及沒有改善時如何調整或終止。能否退款或退出要依書面合約，不能在網站上直接承諾無條件處理。"],
  ];

  const getAnswer = (question, groupId) => {
    const published = publishedAnswers.get(question);
    if (published) return published;
    const rule = answerRules.find(([category, pattern]) => category === groupId && pattern.test(question));
    return rule?.[2] || fallbackAnswers[groupId];
  };

  const updateBrowseBar = (label, canGoBack = true) => {
    breadcrumb.textContent = label;
    backButton.hidden = !canGoBack;
  };

  const renderOverview = () => {
    activeMajor = null;
    activeGroup = null;
    searchStatus.textContent = "";
    updateBrowseBar("所有問題", false);

    const grid = createElement("div", "qaMajorGrid");
    majorGroups.forEach((major) => {
      const button = createElement("button", "qaMajorCard");
      button.type = "button";
      button.dataset.major = major.id;
      button.append(
        createElement("span", "qaStep", major.step),
        createElement("strong", "", major.title),
        createElement("p", "", major.description),
        createElement("span", "qaArrow", "選擇這個方向　→"),
      );
      grid.append(button);
    });
    library.replaceChildren(grid);
  };

  const renderMajor = (majorId) => {
    const major = majorGroups.find((item) => item.id === majorId);
    if (!major) return;
    activeMajor = major.id;
    activeGroup = null;
    searchStatus.textContent = "";
    updateBrowseBar(`所有問題　／　${major.title}`);

    const intro = createElement("div", "qaLevelIntro");
    intro.append(
      createElement("span", "kicker", "再選一個細項"),
      createElement("h3", "", major.title),
      createElement("p", "", major.description),
    );

    const grid = createElement("div", "qaSubGrid");
    major.groups.forEach((groupId) => {
      const category = categories.get(groupId);
      if (!category) return;
      const button = createElement("button", "qaSubCard");
      button.type = "button";
      button.dataset.group = groupId;
      button.append(
        createElement("strong", "", category.title),
        createElement("p", "", category.description),
        createElement("span", "qaArrow", "查看相關問題　→"),
      );
      grid.append(button);
    });

    library.replaceChildren(intro, grid);
  };

  const renderGroup = (groupId, highlightIndex = null) => {
    const category = categories.get(groupId);
    const major = getMajorForGroup(groupId);
    if (!category || !major) return;
    activeMajor = major.id;
    activeGroup = groupId;
    searchStatus.textContent = "";
    updateBrowseBar(`所有問題　／　${major.title}　／　${category.title}`);

    const intro = createElement("div", "qaLevelIntro");
    intro.append(
      createElement("span", "kicker", major.title),
      createElement("h3", "", category.title),
      createElement("p", "", category.description),
    );

    const list = createElement("div", "qaQuestionList");
    category.questions.forEach((question, index) => {
      const item = createElement("details", "qaQuestionCard");
      item.dataset.questionIndex = String(index);
      const summary = createElement("summary", "qaQuestionSummary");
      summary.append(createElement("span", "qaQuestionMark", "Q"), createElement("span", "qaQuestionText", question));
      const answer = createElement("div", "qaAnswer");
      answer.append(
        createElement("span", "qaAnswerMark", "A"),
        createElement("p", "", getAnswer(question, groupId)),
      );
      const consult = createElement("a", "qaAnswerCta", "這題想進一步確認　→");
      consult.href = "#contact";
      answer.append(consult);
      item.append(summary, answer);
      if (index === highlightIndex) {
        item.classList.add("isHighlighted");
        item.open = true;
      }
      list.append(item);
    });

    library.replaceChildren(intro, list);

    if (highlightIndex !== null) {
      requestAnimationFrame(() => {
        const target = library.querySelector(`[data-question-index="${highlightIndex}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  };

  const renderSearch = (rawQuery) => {
    const query = rawQuery.trim().toLocaleLowerCase("zh-Hant");
    if (!query) {
      if (activeGroup) renderGroup(activeGroup);
      else if (activeMajor) renderMajor(activeMajor);
      else renderOverview();
      return;
    }

    const matches = [];
    categories.forEach((category, groupId) => {
      const major = getMajorForGroup(groupId);
      category.questions.forEach((question, index) => {
        if (question.toLocaleLowerCase("zh-Hant").includes(query)) {
          matches.push({ question, index, groupId, category, major });
        }
      });
    });

    activeMajor = null;
    activeGroup = null;
    updateBrowseBar(`搜尋「${rawQuery.trim()}」`, false);
    searchStatus.textContent = matches.length
      ? `找到 ${matches.length} 個相關問題，點選後可查看所屬細項。`
      : `找不到與「${rawQuery.trim()}」相關的問題，可以換一個關鍵字。`;

    if (!matches.length) {
      const empty = createElement("div", "qaEmpty");
      empty.append(createElement("strong", "", "目前沒有符合的問題"), createElement("p", "", "試試看輸入「抽成」、「照片」、「廣告」或「撥款」。"));
      library.replaceChildren(empty);
      return;
    }

    const results = createElement("div", "qaSearchResults");
    matches.forEach((match) => {
      const button = createElement("button", "qaSearchResult");
      button.type = "button";
      button.dataset.searchGroup = match.groupId;
      button.dataset.searchIndex = String(match.index);
      button.append(
        createElement("span", "qaResultPath", `${match.major.title}　／　${match.category.title}`),
        createElement("strong", "", match.question),
        createElement("span", "qaArrow", "查看這個細項　→"),
      );
      results.append(button);
    });
    library.replaceChildren(results);
  };

  const loadSharedSections = async () => {
    const source = await fetchDocument("首頁新版提案.html");
    const contact = source.querySelector("section#contact");
    const modal = source.querySelector("#successModal");
    const footer = source.querySelector("footer.footer");
    const floatLine = source.querySelector(".floatLine");

    if (!contact || !modal || !footer) throw new Error("首頁共用區塊不完整");

    contactMount.replaceChildren(document.importNode(contact, true));
    modalMount.replaceChildren(document.importNode(modal, true));
    footerMount.replaceChildren(document.importNode(footer, true));
    if (floatLine) footerMount.append(document.importNode(floatLine, true));
    footerMount.querySelectorAll(".footerGrid > div:first-child > p").forEach((paragraph) => {
      if (paragraph.textContent.includes("照片來源")) paragraph.remove();
    });

    footerMount.querySelectorAll('a[href="knowledge.html"], a[href="常見QA新版提案.html"]').forEach((link) => link.setAttribute("href", "#top"));

    const sharedScript = document.createElement("script");
    sharedScript.src = "homepage-concept.js?v=9";
    document.body.append(sharedScript);
  };

  const loadQuestionLibrary = async () => {
    const source = await fetchDocument("knowledge.html");
    const sourceCategories = [...source.querySelectorAll(".qa-category")];
    if (!sourceCategories.length) throw new Error("找不到原本的問題分類");

    sourceCategories.forEach((sourceCategory) => {
      const id = sourceCategory.dataset.categoryGroup;
      const title = sourceCategory.querySelector("summary b")?.textContent.trim();
      const description = sourceCategory.querySelector("summary small")?.textContent.trim();
      const questions = [...sourceCategory.querySelectorAll(".qa-question")].map((question) => question.textContent.trim());
      if (id && title && questions.length) categories.set(id, { title, description: description || "", questions });
    });

    renderOverview();

    library.addEventListener("click", (event) => {
      const majorButton = event.target.closest("[data-major]");
      const groupButton = event.target.closest("[data-group]");
      const resultButton = event.target.closest("[data-search-group]");

      if (majorButton) renderMajor(majorButton.dataset.major);
      if (groupButton) renderGroup(groupButton.dataset.group);
      if (resultButton) {
        const groupId = resultButton.dataset.searchGroup;
        const questionIndex = Number(resultButton.dataset.searchIndex);
        searchInput.value = "";
        renderGroup(groupId, questionIndex);
      }
    });

    searchInput.addEventListener("input", () => renderSearch(searchInput.value));
    backButton.addEventListener("click", () => {
      searchInput.value = "";
      if (activeGroup) renderMajor(activeMajor);
      else renderOverview();
    });
  };

  const showLoadError = (message) => createElement("p", "libraryError", message);

  Promise.allSettled([loadQuestionLibrary(), loadSharedSections()]).then((results) => {
    if (results[0].status === "rejected") {
      library.replaceChildren(showLoadError("問題分類暫時無法載入，請重新整理頁面。"));
      searchStatus.textContent = "載入失敗";
    }
    if (results[1].status === "rejected") {
      contactMount.replaceChildren(showLoadError("聯絡表單暫時無法載入，請重新整理頁面。"));
    }
  });
})();
