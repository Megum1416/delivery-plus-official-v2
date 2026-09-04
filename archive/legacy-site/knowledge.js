(() => {
  const search = document.querySelector('#knowledgeSearch');
  const questions = [...document.querySelectorAll('.qa-item')];
  const groups = [...document.querySelectorAll('[data-category-group]')];
  const count = document.querySelector('#knowledgeCount');

  const normalize = (value) => value.trim().toLocaleLowerCase('zh-Hant-TW');

  function updateQuestions() {
    const keyword = normalize(search?.value || '');
    let visible = 0;

    questions.forEach((question) => {
      const matchesKeyword = !keyword || normalize(question.textContent).includes(keyword);
      question.hidden = !matchesKeyword;
      if (!question.hidden) visible += 1;
    });

    groups.forEach((group) => {
      const groupQuestions = [...group.querySelectorAll('.qa-item')];
      const groupVisible = groupQuestions.filter((question) => !question.hidden).length;
      const hasVisibleQuestion = groupVisible > 0;
      group.hidden = !hasVisibleQuestion;
      const groupCount = group.querySelector('.qa-category-summary em');
      if (groupCount) groupCount.textContent = `${keyword ? groupVisible : groupQuestions.length} 題`;
      if (keyword && hasVisibleQuestion) group.open = true;
    });

    if (count) count.textContent = keyword ? `找到 ${visible} 個相關問題` : `完整問題庫：${visible} 題`;
  }

  search?.addEventListener('input', updateQuestions);
  updateQuestions();
})();
