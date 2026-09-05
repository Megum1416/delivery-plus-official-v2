(() => {
  const library = document.querySelector("#qaLibrary");
  const searchInput = document.querySelector("#qaSearch");
  const searchStatus = document.querySelector("#qaSearchStatus");
  const backButton = document.querySelector("#qaBack");
  const breadcrumb = document.querySelector("#qaBreadcrumb");

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

  const createElement = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const getMajorForGroup = (groupId) => majorGroups.find((major) => major.groups.includes(groupId));

  const getQuestionText = (entry) => typeof entry === "string" ? entry : entry.question;

  const getAnswer = (entry) => {
    if (typeof entry === "object" && entry.answer) return entry.answer;
    return "這題的回答正在確認中，請直接與專人聯絡。";
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
    category.questions.forEach((questionEntry, index) => {
      const question = getQuestionText(questionEntry);
      const item = createElement("details", "qaQuestionCard");
      item.dataset.questionIndex = String(index);
      const summary = createElement("summary", "qaQuestionSummary");
      summary.append(createElement("span", "qaQuestionMark", "Q"), createElement("span", "qaQuestionText", question));
      const answer = createElement("div", "qaAnswer");
      answer.append(
        createElement("span", "qaAnswerMark", "A"),
        createElement("p", "", getAnswer(questionEntry)),
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
      category.questions.forEach((questionEntry, index) => {
        const question = getQuestionText(questionEntry);
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

  const loadQuestionLibrary = () => {
    const sourceCategories = Array.isArray(window.QA_LIBRARY) ? window.QA_LIBRARY : [];
    if (!sourceCategories.length) throw new Error("找不到問題分類資料");

    sourceCategories.forEach((sourceCategory) => {
      const { id, title, description, questions } = sourceCategory;
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

  try {
    loadQuestionLibrary();
  } catch {
    library.replaceChildren(createElement("p", "libraryError", "問題分類暫時無法載入，請重新整理頁面。"));
    searchStatus.textContent = "載入失敗";
  }
})();
