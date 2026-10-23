(() => {
  'use strict';

  const app = document.querySelector('[data-diagnosis-app]');
  if (!app) return;

  const form = app.querySelector('[data-diagnosis-form]');
  const questions = [...app.querySelectorAll('[data-question]')];
  const backButton = app.querySelector('[data-question-back]');
  const nextButton = app.querySelector('[data-question-next]');
  const number = app.querySelector('[data-question-number]');
  const questionBar = app.querySelector('[data-question-bar]');
  const questionProgress = app.querySelector('[data-question-progress]');
  const analysis = app.querySelector('[data-analysis]');
  const analysisLabel = app.querySelector('[data-analysis-label]');
  const analysisProgress = app.querySelector('[data-analysis-progress]');
  const analysisBar = analysisProgress.querySelector('i');
  const analysisPercent = app.querySelector('[data-analysis-percent]');
  const result = app.querySelector('[data-diagnosis-result]');
  const restart = app.querySelector('[data-diagnosis-restart]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const steps = ['回答データを解析中', '顔タイプモデルを照合中', '顔のバランスを評価中', '推奨美容プランを生成中'];
  let current = 0;
  let analysisTimer = 0;

  const selected = (name) => form.elements[name]?.value || '';

  const updateQuestion = () => {
    questions.forEach((question, index) => { question.hidden = index !== current; });
    number.textContent = `QUESTION ${current + 1} / ${questions.length}`;
    questionBar.style.width = `${((current + 1) / questions.length) * 100}%`;
    backButton.hidden = current === 0;
    nextButton.textContent = current === questions.length - 1 ? '診断を開始する' : '次の質問へ';
    nextButton.disabled = !selected(questions[current].dataset.question);
  };

  const updateResult = () => {
    const gender = selected('gender');
    const mood = selected('mood');
    const area = selected('area');
    const change = selected('change');
    const moodIndex = { natural: '01', glamorous: '02', intelligent: '03' }[mood];
    const genderLabel = gender === 'female' ? '女性タイプ' : '男性タイプ';
    const moodLabel = { natural: '自然で親しみやすい', glamorous: '華やかで印象的', intelligent: '知的で落ち着いた' }[mood];
    const areaLabel = { eyes: '目元', 'nose-mouth': '鼻・口元', 'face-line': 'フェイスライン' }[area];
    const changeLabel = change === 'subtle' ? '自然な変化' : 'はっきりとした変化';
    const image = result.querySelector('[data-result-image]');
    image.src = `assets/images/ai-face-${gender}-${moodIndex}.jpg`;
    image.alt = `${genderLabel}・${moodLabel}の顔イメージ`;
    result.querySelector('[data-result-type]').textContent = `${genderLabel}／${moodLabel}`;
    result.querySelector('[data-result-balance]').textContent = `${changeLabel}を希望する回答イメージ`;
    result.querySelector('[data-result-impression]').textContent = moodLabel;
    result.querySelector('[data-result-treatment]').textContent = `${areaLabel}の施術メニュー`;
  };

  const showResult = () => {
    window.clearInterval(analysisTimer);
    updateResult();
    analysis.hidden = true;
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => window.FiorneaAnomalyUI?.show('phase1'), reduceMotion.matches ? 0 : 900);
  };

  const startAnalysis = () => {
    form.hidden = true;
    questionProgress.hidden = true;
    analysis.hidden = false;
    let progress = 0;
    const tick = reduceMotion.matches ? 25 : 2;
    const interval = reduceMotion.matches ? 20 : 55;
    const render = () => {
      progress = Math.min(100, progress + tick);
      const stepIndex = Math.min(steps.length - 1, Math.floor(progress / 25));
      analysisLabel.textContent = steps[stepIndex];
      analysisBar.style.width = `${progress}%`;
      analysisPercent.textContent = `${progress}%`;
      analysisProgress.setAttribute('aria-valuenow', String(progress));
      if (progress === 100) window.setTimeout(showResult, reduceMotion.matches ? 0 : 350);
    };
    render();
    analysisTimer = window.setInterval(() => { if (progress < 100) render(); }, interval);
  };

  form.addEventListener('change', () => {
    nextButton.disabled = !selected(questions[current].dataset.question);
  });

  nextButton.addEventListener('click', () => {
    if (!selected(questions[current].dataset.question)) return;
    if (current === questions.length - 1) startAnalysis();
    else { current += 1; updateQuestion(); questions[current].querySelector('input')?.focus(); }
  });

  backButton.addEventListener('click', () => {
    if (current === 0) return;
    current -= 1;
    updateQuestion();
    questions[current].querySelector('input:checked, input')?.focus();
  });

  restart.addEventListener('click', () => {
    window.clearInterval(analysisTimer);
    form.reset();
    current = 0;
    result.hidden = true;
    window.FiorneaAnomalyUI?.hide('phase1');
    analysis.hidden = true;
    form.hidden = false;
    questionProgress.hidden = false;
    analysisBar.style.width = '0%';
    analysisProgress.setAttribute('aria-valuenow', '0');
    analysisPercent.textContent = '0%';
    updateQuestion();
    app.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });

  updateQuestion();
})();
