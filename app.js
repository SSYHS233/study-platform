// ============================================
// 学习平台 - 主程序
// ============================================

(function() {
  'use strict';

  // State
  let currentIndex = 0;
  let isFlipped = false;
  let currentMode = 'all';
  let studyMode = 'flashcard';
  let shuffled = false;
  let typingAnswers = {};
  let searchQuery = '';
  let currentSubject = 'all';
  let currentChapter = 'all';

  // Load persisted state
  let state = loadState();
  let edits = loadEdits();
  let notes = loadNotes();
  let recycleBin = loadRecycleBin();
  let settings = loadSettings();

  // DOM refs
  const card = document.getElementById('card');
  const cardFront = document.getElementById('cardFront');
  const cardBack = document.getElementById('cardBack');
  const cardQuestion = document.getElementById('cardQuestion');
  const cardAnswer = document.getElementById('cardAnswer');
  const cardSource = document.getElementById('cardSource');
  const cardChapter = document.getElementById('cardChapter');
  const topbarCounter = document.getElementById('topbarCounter');
  const topbarTitle = document.getElementById('topbarTitle');
  const questionList = document.getElementById('questionList');
  const markBtn = document.getElementById('markBtn');
  const markText = document.getElementById('markText');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const editBtn = document.getElementById('editBtn');
  const modeAll = document.getElementById('modeAll');
  const modeMarked = document.getElementById('modeMarked');
  const modeUnseen = document.getElementById('modeUnseen');
  const markedBadge = document.getElementById('markedBadge');
  const unseenBadge = document.getElementById('unseenBadge');
  const modeLearned = document.getElementById('modeLearned');
  const learnedBadge = document.getElementById('learnedBadge');
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const sidebarClose = document.getElementById('sidebarClose');
  const resetBtn = document.getElementById('resetBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const exportBtn = document.getElementById('exportBtn');
  const exportModal = document.getElementById('exportModal');
  const modalClose = document.getElementById('modalClose');
  const exportTxt = document.getElementById('exportTxt');
  const exportMd = document.getElementById('exportMd');
  const exportAnki = document.getElementById('exportAnki');
  const exportPreview = document.getElementById('exportPreview');
  const progressBar = document.getElementById('progressBar');
  const statTotal = document.getElementById('statTotal');
  const statViewed = document.getElementById('statViewed');
  const statMarked = document.getElementById('statMarked');
  const statProgress = document.getElementById('statProgress');

  // Study mode buttons
  const studyModeFlashcard = document.getElementById('studyModeFlashcard');
  const studyModeFillblank = document.getElementById('studyModeFillblank');
  const studyModeTyping = document.getElementById('studyModeTyping');

  // Edit modal
  const editModal = document.getElementById('editModal');
  const editModalClose = document.getElementById('editModalClose');
  const editChapter = document.getElementById('editChapter');
  const editQuestion = document.getElementById('editQuestion');
  const editAnswer = document.getElementById('editAnswer');
  const editSource = document.getElementById('editSource');
  const editSaveBtn = document.getElementById('editSaveBtn');
  const editResetBtn = document.getElementById('editResetBtn');
  const editDeleteBtn = document.getElementById('editDeleteBtn');
  const editAddBtn = document.getElementById('editAddBtn');

  // Import modal
  const importModal = document.getElementById('importModal');
  const importModalClose = document.getElementById('importModalClose');
  const importTextarea = document.getElementById('importTextarea');
  const importPreviewBtn = document.getElementById('importPreviewBtn');
  const importConfirmBtn = document.getElementById('importConfirmBtn');
  const importPreviewDiv = document.getElementById('importPreview');
  const importRulesBtn = document.getElementById('importRulesBtn');
  const importRulesContent = document.getElementById('importRulesContent');
  const importBtn = document.getElementById('importBtn');
  const resetViewedBtn = document.getElementById('resetViewedBtn');

  // Manage modal
  const manageModal = document.getElementById('manageModal');
  const manageModalClose = document.getElementById('manageModalClose');
  const manageBtn = document.getElementById('manageBtn');
  const manageList = document.getElementById('manageList');
  const manageSelectAll = document.getElementById('manageSelectAll');
  const manageSelectNone = document.getElementById('manageSelectNone');
  const manageSelectCustom = document.getElementById('manageSelectCustom');
  const manageDeleteSelected = document.getElementById('manageDeleteSelected');
  const manageDeleteAllCustom = document.getElementById('manageDeleteAllCustom');
  const manageSubjectFilter = document.getElementById('manageSubjectFilter');
  const manageNewSubject = document.getElementById('manageNewSubject');
  const manageExistingSubject = document.getElementById('manageExistingSubject');
  const manageMoveBtn = document.getElementById('manageMoveBtn');

  // New features
  const darkModeBtn = document.getElementById('darkModeBtn');
  const searchInput = document.getElementById('searchInput');
  const modeMastered = document.getElementById('modeMastered');
  const masteredBadge = document.getElementById('masteredBadge');
  const recycleBinBtn = document.getElementById('recycleBinBtn');
  const recycleModal = document.getElementById('recycleModal');
  const recycleModalClose = document.getElementById('recycleModalClose');
  const recycleList = document.getElementById('recycleList');
  const recycleEmptyBtn = document.getElementById('recycleEmptyBtn');
  const recycleRestoreAllBtn = document.getElementById('recycleRestoreAllBtn');
  const masteredBtn = document.getElementById('masteredBtn');
  const masteredText = document.getElementById('masteredText');
  const learnedBtn = document.getElementById('learnedBtn');
  const learnedText = document.getElementById('learnedText');
  const learnedDownBtn = document.getElementById('learnedDownBtn');
  const learnedUpBtn = document.getElementById('learnedUpBtn');
  const allCountHint = document.getElementById('allCountHint');
  const editNote = document.getElementById('editNote');
  const chapterSelect = document.getElementById('chapterSelect');
  const subjectSelect = document.getElementById('subjectSelect');
  const importSubject = document.getElementById('importSubject');
  const editSubject = document.getElementById('editSubject');
  const learnedCount = document.getElementById('learnedCount');
  const manageSubjectBtn = document.getElementById('manageSubjectBtn');
  const subjectTreeModal = document.getElementById('subjectTreeModal');
  const subjectTreeClose = document.getElementById('subjectTreeClose');
  const stAddInput = document.getElementById('stAddInput');
  const stAddBtn = document.getElementById('stAddBtn');
  const stTree = document.getElementById('stTree');
  const toastEl = document.getElementById('toast');
  const subjectProgressList = document.getElementById('subjectProgressList');
  const aboutBtn = document.getElementById('aboutBtn');
  const aboutModal = document.getElementById('aboutModal');
  const aboutClose = document.getElementById('aboutClose');
  const learnedWrapper = document.getElementById('learnedWrapper');
  const learnedPopup = document.getElementById('learnedPopup');

  // ============================================
  // State Management
  // ============================================
  function loadState() {
    try {
      var saved = localStorage.getItem('study-platform-state');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { marked: [], viewed: [], mastered: [], learnedCounts: {}, lastIndex: 0 };
  }

  function saveState() {
    try {
      localStorage.setItem('study-platform-state', JSON.stringify(state));
    } catch(e) {}
  }

  // Save imported questions to localStorage
  function saveImportedQuestions() {
    try {
      var imported = [];
      for (var i = 0; i < QUESTIONS.length; i++) {
        if (edits[QUESTIONS[i].id] && edits[QUESTIONS[i].id].custom) {
          imported.push(QUESTIONS[i]);
        }
      }
      localStorage.setItem('study-platform-imported', JSON.stringify(imported));

      // Save subject overrides for non-custom questions so renames persist
      var subjectOverrides = {};
      for (var j = 0; j < QUESTIONS.length; j++) {
        var qid = QUESTIONS[j].id;
        if (edits[qid] && edits[qid].subject && !(edits[qid] && edits[qid].custom)) {
          subjectOverrides[qid] = edits[qid].subject;
        }
      }
      localStorage.setItem('study-platform-subjects', JSON.stringify(subjectOverrides));
    } catch(e) {}
  }

  // Load imported questions from localStorage
  function loadImportedQuestions() {
    try {
      var saved = localStorage.getItem('study-platform-imported');
      if (saved) {
        var imported = JSON.parse(saved);
        for (var i = 0; i < imported.length; i++) {
          var exists = false;
          for (var j = 0; j < QUESTIONS.length; j++) {
            if (QUESTIONS[j].id === imported[i].id) {
              exists = true;
              break;
            }
          }
          if (!exists) {
            QUESTIONS.push(imported[i]);
          }
        }
      }

      // Load subject overrides for non-custom questions
      var overrides = localStorage.getItem('study-platform-subjects');
      if (overrides) {
        var subjectMap = JSON.parse(overrides);
        for (var k = 0; k < QUESTIONS.length; k++) {
          if (subjectMap[QUESTIONS[k].id] && (!edits[QUESTIONS[k].id] || !edits[QUESTIONS[k].id].custom)) {
            if (!edits[QUESTIONS[k].id]) edits[QUESTIONS[k].id] = {};
            edits[QUESTIONS[k].id].subject = subjectMap[QUESTIONS[k].id];
          }
        }
      }
    } catch(e) {}
  }

  // ============================================
  // Toast
  // ============================================
  var toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { toastEl.classList.remove('show'); }, 800);
  }

  // ============================================
  // Edits Management
  // ============================================
  function loadEdits() {
    try {
      var saved = localStorage.getItem('study-platform-edits');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {};
  }

  function saveEdits() {
    try {
      localStorage.setItem('study-platform-edits', JSON.stringify(edits));
    } catch(e) {}
  }

  // Notes management
  function loadNotes() {
    try {
      var saved = localStorage.getItem('study-platform-notes');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {};
  }

  function saveNotes() {
    try {
      localStorage.setItem('study-platform-notes', JSON.stringify(notes));
    } catch(e) {}
  }

  // Recycle bin
  function loadRecycleBin() {
    try {
      var saved = localStorage.getItem('study-platform-recycle');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  }

  function saveRecycleBin() {
    try {
      localStorage.setItem('study-platform-recycle', JSON.stringify(recycleBin));
    } catch(e) {}
  }

  function addToRecycleBin(q) {
    recycleBin.push(q);
    saveRecycleBin();
  }

  function restoreFromRecycleBin(qid) {
    for (var i = 0; i < recycleBin.length; i++) {
      if (recycleBin[i].id === qid) {
        var q = recycleBin.splice(i, 1)[0];
        QUESTIONS.push(q);
        saveRecycleBin();
        saveImportedQuestions();
        return true;
      }
    }
    return false;
  }

  // Settings
  function loadSettings() {
    try {
      var saved = localStorage.getItem('study-platform-settings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { darkMode: false };
  }

  function saveSettings() {
    try {
      localStorage.setItem('study-platform-settings', JSON.stringify(settings));
    } catch(e) {}
  }

  // Get question with edits applied
  function getQuestion(qid) {
    var original = null;
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].id === qid) { original = QUESTIONS[i]; break; }
    }
    if (!original) return null;
    if (edits[qid]) {
      return {
        id: original.id,
        subject: edits[qid].subject || original.subject || '',
        chapter: edits[qid].chapter || original.chapter,
        question: edits[qid].question || original.question,
        answer: edits[qid].answer || original.answer,
        source: edits[qid].source || original.source,
        note: notes[qid] || ''
      };
    }
    return Object.assign({}, original, { subject: original.subject || '', note: notes[qid] || '' });
  }

  // Get all questions with edits applied
  function getAllQuestions() {
    return QUESTIONS.map(function(q) { return getQuestion(q.id); });
  }

  // ============================================
  // Edit Modal
  // ============================================
  let editingQid = null;

  function openEditModal(qid) {
    editingQid = qid;
    var q = getQuestion(qid);
    if (!q) return;

    editSubject.value = q.subject || '';
    editChapter.value = q.chapter || '';
    editQuestion.value = q.question || '';
    editAnswer.value = q.answer || '';
    editSource.value = q.source || '';
    editNote.value = notes[qid] || '';

    // Show/hide delete button based on whether it's a custom question
    var isCustom = edits[qid] && edits[qid].custom;
    editDeleteBtn.style.display = isCustom ? 'inline-flex' : 'none';

    editModal.classList.add('show');
  }

  function closeEditModal() {
    editModal.classList.remove('show');
    editingQid = null;
  }

  function saveEdit() {
    if (!editingQid) return;

    edits[editingQid] = {
      subject: editSubject.value.trim(),
      chapter: editChapter.value.trim(),
      question: editQuestion.value.trim(),
      answer: editAnswer.value.trim(),
      source: editSource.value.trim(),
      custom: edits[editingQid] ? edits[editingQid].custom : false
    };

    // Save note
    var noteText = editNote.value.trim();
    if (noteText) {
      notes[editingQid] = noteText;
    } else {
      delete notes[editingQid];
    }

    saveEdits();
    saveNotes();
    saveImportedQuestions();
    populateSubjectSelect();
    populateChapterSelect();
    closeEditModal();
    render();
  }

  function resetEdit() {
    if (!editingQid) return;
    if (confirm('确定要恢复这道题的原始内容吗？')) {
      delete edits[editingQid];
      saveEdits();
      saveImportedQuestions();
      closeEditModal();
      render();
    }
  }

  function deleteQuestion() {
    if (!editingQid) return;
    // Check if it's a custom question
    if (edits[editingQid] && edits[editingQid].custom) {
      if (confirm('确定要删除这道题吗？')) {
        // Remove from QUESTIONS array
        for (var i = 0; i < QUESTIONS.length; i++) {
          if (QUESTIONS[i].id === editingQid) {
            QUESTIONS.splice(i, 1);
            break;
          }
        }
        delete edits[editingQid];
        // Remove from state
        var markedIdx = state.marked.indexOf(editingQid);
        if (markedIdx !== -1) state.marked.splice(markedIdx, 1);
        var viewedIdx = state.viewed.indexOf(editingQid);
        if (viewedIdx !== -1) state.viewed.splice(viewedIdx, 1);
        saveState();
        saveEdits();
        closeEditModal();
        if (currentIndex > 0) currentIndex--;
        populateSubjectSelect();
        populateChapterSelect();
        render();
      }
    } else {
      alert('只能删除自定义添加的题目');
    }
  }

  function addNewQuestion() {
    // Find max id
    var maxId = 0;
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].id > maxId) maxId = QUESTIONS[i].id;
    }
    var newId = maxId + 1;

    // Add to QUESTIONS
    var newQ = {
      id: newId,
      subject: '自定义',
      chapter: '自定义',
      question: '新题目',
      answer: '请填写答案',
      source: ''
    };
    QUESTIONS.push(newQ);

    // Mark as custom in edits
    edits[newId] = {
      subject: '自定义',
      chapter: '自定义',
      question: '新题目',
      answer: '请填写答案',
      source: '',
      custom: true
    };
    saveEdits();
    saveImportedQuestions();
    populateSubjectSelect();
    populateChapterSelect();

    // Open edit modal for the new question
    openEditModal(newId);
  }

  // ============================================
  // Get filtered questions
  // ============================================
  function getFilteredQuestions() {
    var all = getAllQuestions();
    var filtered = all;

    // Filter by mode
    if (currentMode === 'marked') {
      filtered = filtered.filter(function(q) { return state.marked.includes(q.id); });
    } else if (currentMode === 'unseen') {
      filtered = filtered.filter(function(q) { return !state.viewed.includes(q.id); });
    } else if (currentMode === 'mastered') {
      filtered = filtered.filter(function(q) { return state.mastered && state.mastered.includes(q.id); });
    } else if (currentMode === 'learned') {
      filtered = filtered.filter(function(q) { return state.learnedCounts && state.learnedCounts[q.id] > 0; });
    } else {
      // 'all' mode - exclude mastered
      filtered = filtered.filter(function(q) { return !state.mastered || !state.mastered.includes(q.id); });
    }

    // Filter by subject
    if (currentSubject !== 'all') {
      filtered = filtered.filter(function(q) { return (q.subject || '未分类') === currentSubject; });
    }

    // Filter by chapter
    if (currentChapter !== 'all') {
      filtered = filtered.filter(function(q) { return q.chapter === currentChapter; });
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(function(q) {
        return q.question.toLowerCase().indexOf(searchQuery) !== -1 ||
               q.answer.toLowerCase().indexOf(searchQuery) !== -1 ||
               q.chapter.toLowerCase().indexOf(searchQuery) !== -1;
      });
    }

    if (shuffled) {
      filtered = shuffleArray(filtered);
    }
    return filtered;
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ============================================
  // Fill-in-the-blank: extract key terms
  // ============================================
  function extractKeyTerms(answer) {
    var terms = [];
    var acronymMatches = answer.match(/\b[A-Z]{2,}\b/g) || [];
    terms = terms.concat(acronymMatches);
    var parenMatches = answer.match(/（[^）]+）/g) || [];
    terms = terms.concat(parenMatches);
    var keyPhrases = answer.match(/[一-龥]{4,}(?:层结|不稳定|急流|辐合|辐散|切变|对流|风暴|气流|涡度|散度|回波|气旋)/g) || [];
    terms = terms.concat(keyPhrases);

    var seen = {};
    var unique = [];
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i].replace(/[（）]/g, '').trim();
      if (t.length >= 2 && !seen[t]) {
        seen[t] = true;
        unique.push(t);
      }
    }
    unique.sort(function(a, b) { return b.length - a.length; });
    return unique.slice(0, 8);
  }

  function createFillBlankHTML(answer) {
    var terms = extractKeyTerms(answer);
    if (terms.length === 0) return { html: answer, terms: [] };

    var html = answer;
    var blanks = [];
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      var placeholder = '____' + (i + 1) + '____';
      if (html.indexOf(term) !== -1) {
        html = html.replace(term, '<span class="blank-slot" data-index="' + i + '" data-answer="' + term.replace(/"/g, '&quot;') + '"><input type="text" class="blank-input" data-index="' + i + '" placeholder="' + placeholder + '"><span class="blank-result"></span></span>');
        blanks.push(term);
      }
    }
    return { html: html, terms: blanks };
  }

  // ============================================
  // Typing mode
  // ============================================
  function saveTypingAnswer(qid, text) { typingAnswers[qid] = text; }
  function getTypingAnswer(qid) { return typingAnswers[qid] || ''; }

  function compareAnswers(userAnswer, correctAnswer) {
    if (!userAnswer.trim()) return { similarity: 0 };
    var userChars = userAnswer.replace(/\s/g, '');
    var correctChars = correctAnswer.replace(/\s/g, '');
    var matches = 0;
    var correctIdx = 0;
    for (var i = 0; i < userChars.length; i++) {
      var idx = correctChars.indexOf(userChars[i], correctIdx);
      if (idx !== -1) { matches++; correctIdx = idx + 1; }
    }
    var similarity = correctChars.length > 0 ? Math.round((matches / correctChars.length) * 100) : 0;
    return { similarity: Math.min(similarity, 100) };
  }

  // ============================================
  // Render
  // ============================================
  function render() {
    var filtered = getFilteredQuestions();
    if (filtered.length === 0) {
      cardQuestion.textContent = currentMode === 'marked' ? '还没有标记任何题目' : '所有题目都已学习完毕！';
      cardAnswer.textContent = '';
      cardSource.textContent = '';
      cardChapter.textContent = '';
      topbarCounter.textContent = '0 / 0';
      markBtn.classList.remove('marked');
      markText.textContent = '标记';
      var fbArea = document.getElementById('fillBlankArea');
      if (fbArea) fbArea.style.display = 'none';
      var typeArea = document.getElementById('typingArea');
      if (typeArea) typeArea.style.display = 'none';
      return;
    }

    if (currentIndex >= filtered.length) currentIndex = filtered.length - 1;

    var q = filtered[currentIndex];

    cardChapter.textContent = q.chapter;
    cardQuestion.textContent = q.question;
    cardAnswer.textContent = q.answer;
    cardSource.textContent = q.source ? ('📚 ' + q.source) : '';
    topbarCounter.textContent = (currentIndex + 1) + ' / ' + filtered.length;

    var isMarked = state.marked.includes(q.id);
    markBtn.classList.toggle('marked', isMarked);
    markText.textContent = isMarked ? '取消标记' : '标记';

    var isMastered = state.mastered && state.mastered.includes(q.id);
    masteredBtn.classList.toggle('mastered-active', isMastered);
    masteredText.textContent = isMastered ? '继续背' : '不背了';

    // 显示学习次数
    var lc = state.learnedCounts ? (state.learnedCounts[q.id] || 0) : 0;
    if (lc > 0) {
      learnedText.textContent = '背了(' + lc + ')';
      learnedBtn.classList.add('learned');
    } else {
      learnedText.textContent = '背了';
      learnedBtn.classList.remove('learned');
    }
    learnedCount.textContent = lc;

    // Show edit indicator if question has been edited
    if (edits[q.id]) {
      editBtn.classList.add('edited');
    } else {
      editBtn.classList.remove('edited');
    }

    isFlipped = false;
    cardFront.classList.remove('hidden');
    cardBack.classList.remove('show');

    // Show note if exists
    var existingNote = cardBack.querySelector('.card-note');
    if (existingNote) existingNote.remove();
    if (q.note) {
      var noteDiv = document.createElement('div');
      noteDiv.className = 'card-note';
      noteDiv.innerHTML = '<div class="card-note-label">📝 我的备注</div><div class="card-note-text">' + escapeHtml(q.note) + '</div>';
      cardBack.appendChild(noteDiv);
    }

    renderStudyMode(q);
    renderQuestionList();
    scrollToListItem();
    updateStats();
    renderSubjectProgress();
  }

  function renderStudyMode(q) {
    var fbArea = document.getElementById('fillBlankArea');
    var typeArea = document.getElementById('typingArea');

    if (studyMode === 'fillblank') {
      if (fbArea) fbArea.style.display = 'block';
      if (typeArea) typeArea.style.display = 'none';
      var result = createFillBlankHTML(q.answer);
      if (result.terms.length > 0) {
        fbArea.innerHTML = '<div class="fb-instructions">填写空白处的关键词（共 ' + result.terms.length + ' 个空）</div>' +
          '<div class="fb-content">' + result.html + '</div>' +
          '<button class="btn btn-primary fb-check-btn" id="fbCheckBtn">检查答案</button>' +
          '<button class="btn btn-outline fb-reveal-btn" id="fbRevealBtn" style="display:none">显示全部答案</button>' +
          '<div class="fb-result-summary" id="fbResultSummary"></div>';
        var checkBtn = document.getElementById('fbCheckBtn');
        var revealBtn = document.getElementById('fbRevealBtn');
        if (checkBtn) checkBtn.addEventListener('click', checkFillBlanks);
        if (revealBtn) revealBtn.addEventListener('click', revealAllBlanks);
      } else {
        fbArea.innerHTML = '<div class="fb-no-blanks">此题没有找到可填空的关键词，请使用默写模式。</div>';
      }
    } else if (studyMode === 'typing') {
      if (fbArea) fbArea.style.display = 'none';
      if (typeArea) typeArea.style.display = 'block';
      var savedAnswer = getTypingAnswer(q.id);
      typeArea.innerHTML =
        '<div class="type-instructions">在下方输入你的答案，然后点击「对照答案」查看差异</div>' +
        '<textarea class="type-textarea" id="typeTextarea" placeholder="在这里默写你的答案...">' + escapeAttr(savedAnswer) + '</textarea>' +
        '<div class="type-actions">' +
          '<button class="btn btn-primary" id="typeCompareBtn">对照答案</button>' +
          '<button class="btn btn-outline" id="typeClearBtn">清空</button>' +
        '</div>' +
        '<div class="type-comparison" id="typeComparison"></div>';
      var textarea = document.getElementById('typeTextarea');
      var compareBtn = document.getElementById('typeCompareBtn');
      var clearBtn = document.getElementById('typeClearBtn');
      if (textarea) textarea.addEventListener('input', function() { saveTypingAnswer(q.id, textarea.value); });
      if (compareBtn) compareBtn.addEventListener('click', function() { showComparison(q); });
      if (clearBtn) clearBtn.addEventListener('click', function() {
        textarea.value = ''; saveTypingAnswer(q.id, '');
        var comp = document.getElementById('typeComparison');
        if (comp) comp.innerHTML = '';
      });
    } else {
      if (fbArea) fbArea.style.display = 'none';
      if (typeArea) typeArea.style.display = 'none';
    }
  }

  // ============================================
  // Fill-blank checking
  // ============================================
  function checkFillBlanks() {
    var blanks = document.querySelectorAll('.blank-slot');
    var correct = 0;
    for (var i = 0; i < blanks.length; i++) {
      var slot = blanks[i];
      var input = slot.querySelector('.blank-input');
      var result = slot.querySelector('.blank-result');
      var answer = slot.getAttribute('data-answer');
      if (input.value.trim() === answer) {
        correct++;
        result.textContent = ' ✓'; result.className = 'blank-result correct';
        input.style.borderColor = '#10b981'; input.style.background = '#d1fae5';
      } else {
        result.textContent = ' ✗ 正确答案: ' + answer; result.className = 'blank-result incorrect';
        input.style.borderColor = '#ef4444'; input.style.background = '#fee2e2';
      }
    }
    var summary = document.getElementById('fbResultSummary');
    if (summary) {
      var pct = blanks.length > 0 ? Math.round((correct / blanks.length) * 100) : 0;
      summary.innerHTML = '<div class="fb-score">得分: ' + correct + ' / ' + blanks.length + ' (' + pct + '%)</div>';
    }
    var checkBtn = document.getElementById('fbCheckBtn');
    var revealBtn = document.getElementById('fbRevealBtn');
    if (checkBtn) checkBtn.style.display = 'none';
    if (revealBtn) revealBtn.style.display = 'inline-flex';
  }

  function revealAllBlanks() {
    var blanks = document.querySelectorAll('.blank-slot');
    for (var i = 0; i < blanks.length; i++) {
      var slot = blanks[i];
      var input = slot.querySelector('.blank-input');
      var result = slot.querySelector('.blank-result');
      var answer = slot.getAttribute('data-answer');
      input.value = answer; input.disabled = true;
      result.textContent = ' ✓'; result.className = 'blank-result correct';
      input.style.borderColor = '#10b981'; input.style.background = '#d1fae5';
    }
  }

  // ============================================
  // Typing comparison
  // ============================================
  function showComparison(q) {
    var textarea = document.getElementById('typeTextarea');
    var compDiv = document.getElementById('typeComparison');
    if (!textarea || !compDiv) return;
    var userText = textarea.value.trim();
    if (!userText) { compDiv.innerHTML = '<div class="comp-empty">请先输入你的答案</div>'; return; }
    var result = compareAnswers(userText, q.answer);
    var scoreClass = result.similarity >= 70 ? ' high' : result.similarity >= 40 ? ' mid' : ' low';
    var html = '<div class="comp-header"><div class="comp-score">相似度: <span class="comp-score-num' + scoreClass + '">' + result.similarity + '%</span></div></div>';
    html += '<div class="comp-columns">';
    html += '<div class="comp-col"><div class="comp-col-title">你的答案</div><div class="comp-col-content">' + escapeHtml(userText) + '</div></div>';
    html += '<div class="comp-col"><div class="comp-col-title">标准答案</div><div class="comp-col-content">' + escapeHtml(q.answer) + '</div></div>';
    html += '</div>';
    compDiv.innerHTML = html;
  }

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  function escapeAttr(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ============================================
  // Stats & List
  // ============================================
  // Track expanded sections
  var expandedSections = {};

  function renderQuestionList() {
    var filtered = getFilteredQuestions();
    questionList.innerHTML = '';

    // Group by subject → chapter
    var subjects = {};
    var subjectOrder = [];
    for (var i = 0; i < filtered.length; i++) {
      var subj = filtered[i].subject || '未分类';
      var ch = filtered[i].chapter || '未分类';
      if (!subjects[subj]) {
        subjects[subj] = {};
        subjectOrder.push(subj);
      }
      if (!subjects[subj][ch]) {
        subjects[subj][ch] = [];
      }
      subjects[subj][ch].push({ q: filtered[i], globalIdx: i });
    }

    for (var si = 0; si < subjectOrder.length; si++) {
      var subjectName = subjectOrder[si];
      var chapters = subjects[subjectName];
      var chapterKeys = Object.keys(chapters);
      var totalInSubject = 0;
      for (var ck = 0; ck < chapterKeys.length; ck++) totalInSubject += chapters[chapterKeys[ck]].length;

      var subjectSection = document.createElement('div');
      subjectSection.className = 'chapter-section';

      // Subject header
      var subjectHeader = document.createElement('div');
      subjectHeader.className = 'chapter-header';
      subjectHeader.style.fontWeight = '700';

      var subjectArrow = document.createElement('span');
      subjectArrow.className = 'chapter-arrow' + (expandedSections['s:'+subjectName] ? ' expanded' : '');
      subjectArrow.textContent = '▶';

      var subjectLabel = document.createElement('span');
      subjectLabel.className = 'chapter-name';
      subjectLabel.textContent = '📁 ' + subjectName;

      var subjectCount = document.createElement('span');
      subjectCount.className = 'chapter-count';
      subjectCount.textContent = totalInSubject;

      subjectHeader.appendChild(subjectArrow);
      subjectHeader.appendChild(subjectLabel);
      subjectHeader.appendChild(subjectCount);

      var subjectBody = document.createElement('div');
      subjectBody.className = 'chapter-items' + (expandedSections['s:'+subjectName] ? ' expanded' : '');

      // Toggle subject expand/collapse
      (function(sn, hdr, arr, body) {
        hdr.onclick = function() {
          expandedSections['s:'+sn] = !expandedSections['s:'+sn];
          arr.classList.toggle('expanded', expandedSections['s:'+sn]);
          body.classList.toggle('expanded', expandedSections['s:'+sn]);
        };
      })(subjectName, subjectHeader, subjectArrow, subjectBody);

      // Chapters inside subject
      for (var ci = 0; ci < chapterKeys.length; ci++) {
        var chapterName = chapterKeys[ci];
        var items = chapters[chapterName];

        var section = document.createElement('div');
        section.className = 'chapter-section';

        var header = document.createElement('div');
        header.className = 'chapter-header';

        var arrow = document.createElement('span');
        arrow.className = 'chapter-arrow' + (expandedSections['c:'+subjectName+':'+chapterName] ? ' expanded' : '');
        arrow.textContent = '▶';

        var name = document.createElement('span');
        name.className = 'chapter-name';
        name.textContent = chapterName;

        var count = document.createElement('span');
        count.className = 'chapter-count';
        count.textContent = items.length;

        header.appendChild(arrow);
        header.appendChild(name);
        header.appendChild(count);

        var itemsContainer = document.createElement('div');
        itemsContainer.className = 'chapter-items' + (expandedSections['c:'+subjectName+':'+chapterName] ? ' expanded' : '');

        for (var qi = 0; qi < items.length; qi++) {
          var q = items[qi].q;
          var globalIdx = items[qi].globalIdx;
          var item = document.createElement('div');
          item.className = 'question-item' + (globalIdx === currentIndex ? ' active' : '');

          var icon = document.createElement('span');
          icon.className = 'q-icon';
          icon.title = '点击标记已学会';
          if (state.marked.includes(q.id)) { icon.className += ' marked'; icon.textContent = '★'; }
          else if (state.viewed.includes(q.id)) { icon.className += ' seen'; icon.textContent = '✓'; }
          else { icon.className += ' unseen'; icon.textContent = '·'; }

          (function(qid) {
            icon.onclick = function(ev) {
              ev.stopPropagation();
              toggleViewed(qid);
            };
          })(q.id);

          (function(idx) {
            item.onclick = function() { currentIndex = idx; render(); };
          })(globalIdx);

          var text = document.createElement('span');
          text.textContent = q.question.length > 40 ? q.question.substring(0, 40) + '...' : q.question;

          item.appendChild(icon);
          item.appendChild(text);
          itemsContainer.appendChild(item);
        }

        (function(cn, sn, hdr2, arr2, cont) {
          hdr2.onclick = function() {
            var key = 'c:'+sn+':'+cn;
            expandedSections[key] = !expandedSections[key];
            arr2.classList.toggle('expanded', expandedSections[key]);
            cont.classList.toggle('expanded', expandedSections[key]);
          };
        })(chapterName, subjectName, header, arrow, itemsContainer);

        section.appendChild(header);
        section.appendChild(itemsContainer);
        subjectBody.appendChild(section);
      }

      subjectSection.appendChild(subjectHeader);
      subjectSection.appendChild(subjectBody);
      questionList.appendChild(subjectSection);
    }
  }

  function getQuestionSubject(q) {
    if (edits[q.id] && edits[q.id].subject) return edits[q.id].subject;
    return q.subject || '';
  }

  function populateSubjectSelect() {
    var subjects = {};
    for (var i = 0; i < QUESTIONS.length; i++) {
      var s = getQuestionSubject(QUESTIONS[i]) || '未分类';
      subjects[s] = true;
    }
    var currentVal = subjectSelect.value;
    subjectSelect.innerHTML = '<option value="all">全部科目</option>';
    var keys = Object.keys(subjects);
    for (var j = 0; j < keys.length; j++) {
      var opt = document.createElement('option');
      opt.value = keys[j];
      opt.textContent = keys[j];
      subjectSelect.appendChild(opt);
    }
    if (currentVal && currentVal !== 'all' && subjects[currentVal]) {
      subjectSelect.value = currentVal;
    } else {
      subjectSelect.value = 'all';
      currentSubject = 'all';
    }
  }

  function populateChapterSelect() {
    var chapters = {};
    for (var i = 0; i < QUESTIONS.length; i++) {
      var s = getQuestionSubject(QUESTIONS[i]) || '未分类';
      if (currentSubject !== 'all' && s !== currentSubject) continue;
      var ch = (edits[QUESTIONS[i].id] && edits[QUESTIONS[i].id].chapter) || QUESTIONS[i].chapter || '未分类';
      chapters[ch] = true;
    }
    var currentVal = chapterSelect.value;
    chapterSelect.innerHTML = '<option value="all">全部章节</option>';
    var keys = Object.keys(chapters);
    for (var j = 0; j < keys.length; j++) {
      var opt = document.createElement('option');
      opt.value = keys[j];
      opt.textContent = keys[j];
      chapterSelect.appendChild(opt);
    }
    if (currentVal && currentVal !== 'all' && chapters[currentVal]) {
      chapterSelect.value = currentVal;
    } else {
      chapterSelect.value = 'all';
      currentChapter = 'all';
    }
  }

  function updateStats() {
    var total = QUESTIONS.length;
    var viewed = state.viewed.length;
    var marked = state.marked.length;
    var masteredCount = state.mastered ? state.mastered.length : 0;
    var learnedCount = 0;
    if (state.learnedCounts) {
      for (var qid in state.learnedCounts) {
        if (state.learnedCounts[qid] > 0) learnedCount++;
      }
    }
    var progress = total > 0 ? Math.round((viewed / total) * 100) : 0;
    statTotal.textContent = total;
    statViewed.textContent = viewed;
    statMarked.textContent = marked;
    statProgress.textContent = progress + '%';
    progressBar.style.width = progress + '%';
    markedBadge.textContent = marked;
    unseenBadge.textContent = total - viewed;
    masteredBadge.textContent = masteredCount;
    learnedBadge.textContent = learnedCount;
    allCountHint.textContent = '(' + total + ')';
  }

  function scrollToListItem() {
    var active = questionList.querySelector('.question-item.active');
    if (active) {
      // Expand parent chapter if collapsed
      var chapterItems = active.closest('.chapter-items');
      if (chapterItems && !chapterItems.classList.contains('expanded')) {
        chapterItems.classList.add('expanded');
        var arrow = chapterItems.previousElementSibling;
        if (arrow) {
          var arrSpan = arrow.querySelector('.chapter-arrow');
          if (arrSpan) arrSpan.classList.add('expanded');
        }
      }
      // Expand parent subject if collapsed
      var subjectBody = active.closest('.st-body') || active.closest('.chapter-items');
      if (subjectBody) {
        var parentSubject = subjectBody.closest('.st-subject') || subjectBody.parentElement;
        if (parentSubject) {
          var subjBody = parentSubject.querySelector('.st-body');
          if (subjBody && !subjBody.classList.contains('expanded')) {
            subjBody.classList.add('expanded');
            var subjArrow = parentSubject.querySelector('.st-arrow');
            if (subjArrow) subjArrow.classList.add('expanded');
          }
        }
      }
      active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  var spColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

  function renderSubjectProgress() {
    subjectProgressList.innerHTML = '';
    var subjects = {};
    var subjectOrder = [];
    for (var i = 0; i < QUESTIONS.length; i++) {
      var subj = getQuestionSubject(QUESTIONS[i]) || '未分类';
      if (!subjects[subj]) { subjects[subj] = { total: 0, viewed: 0 }; subjectOrder.push(subj); }
      subjects[subj].total++;
      if (state.viewed.includes(QUESTIONS[i].id)) subjects[subj].viewed++;
    }

    for (var j = 0; j < subjectOrder.length; j++) {
      var name = subjectOrder[j];
      var data = subjects[name];
      var pct = data.total > 0 ? Math.round((data.viewed / data.total) * 100) : 0;
      var color = spColors[j % spColors.length];

      var item = document.createElement('div');
      item.className = 'sp-item';

      var header = document.createElement('div');
      header.className = 'sp-header';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'sp-name';
      nameSpan.textContent = name;
      nameSpan.title = name;

      var statsSpan = document.createElement('span');
      statsSpan.className = 'sp-stats';
      statsSpan.textContent = data.viewed + '/' + data.total + ' ' + pct + '%';

      header.appendChild(nameSpan);
      header.appendChild(statsSpan);

      var barBg = document.createElement('div');
      barBg.className = 'sp-bar-bg';
      var bar = document.createElement('div');
      bar.className = 'sp-bar';
      bar.style.background = color;
      // Trigger reflow for animation
      requestAnimationFrame(function(b, p) { b.style.width = p + '%'; }.bind(null, bar, pct));

      barBg.appendChild(bar);
      item.appendChild(header);
      item.appendChild(barBg);
      subjectProgressList.appendChild(item);
    }
  }

  // ============================================
  // Actions
  // ============================================
  function flipCard() {
    isFlipped = !isFlipped;
    if (isFlipped) { cardFront.classList.add('hidden'); cardBack.classList.add('show'); }
    else { cardFront.classList.remove('hidden'); cardBack.classList.remove('show'); }
  }

  function nextQuestion() {
    var filtered = getFilteredQuestions();
    if (currentIndex < filtered.length - 1) { currentIndex++; render(); }
  }

  function prevQuestion() {
    if (currentIndex > 0) { currentIndex--; render(); }
  }

  function toggleMark() {
    var filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    var q = filtered[currentIndex];
    var idx = state.marked.indexOf(q.id);
    if (idx === -1) { state.marked.push(q.id); showToast('已标记'); }
    else { state.marked.splice(idx, 1); showToast('已取消'); }
    saveState();
    render();
  }

  function toggleMastered() {
    var filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    var q = filtered[currentIndex];
    if (!state.mastered) state.mastered = [];
    var idx = state.mastered.indexOf(q.id);
    if (idx === -1) { state.mastered.push(q.id); showToast('跳过'); }
    else { state.mastered.splice(idx, 1); showToast('已恢复'); }
    saveState();
    render();
  }

  function increaseLearned() {
    var filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    var q = filtered[currentIndex];
    if (!state.learnedCounts) state.learnedCounts = {};
    state.learnedCounts[q.id] = (state.learnedCounts[q.id] || 0) + 1;
    saveState();
    learnedPopup.classList.remove('show');
    showToast('+' + state.learnedCounts[q.id]);
    render();
  }

  function decreaseLearned() {
    var filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    var q = filtered[currentIndex];
    if (!state.learnedCounts) state.learnedCounts = {};
    var count = state.learnedCounts[q.id] || 0;
    if (count > 0) {
      state.learnedCounts[q.id] = count - 1;
      showToast('' + state.learnedCounts[q.id]);
    }
    saveState();
    learnedPopup.classList.remove('show');
    render();
  }

  function openEdit() {
    var filtered = getFilteredQuestions();
    if (filtered.length === 0) return;
    var q = filtered[currentIndex];
    openEditModal(q.id);
  }

  function setMode(mode) {
    currentMode = mode; currentIndex = 0;
    [modeAll, modeMarked, modeUnseen, modeMastered, modeLearned].forEach(function(btn) { btn.classList.remove('active'); });
    if (mode === 'all') modeAll.classList.add('active');
    else if (mode === 'marked') modeMarked.classList.add('active');
    else if (mode === 'unseen') modeUnseen.classList.add('active');
    else if (mode === 'mastered') modeMastered.classList.add('active');
    else if (mode === 'learned') modeLearned.classList.add('active');
    topbarTitle.textContent = { all: '全部题目', marked: '标记题目', unseen: '未学习', mastered: '不背了', learned: '已学习' }[mode];
    render();
  }

  function setStudyMode(mode) {
    studyMode = mode;
    [studyModeFlashcard, studyModeFillblank, studyModeTyping].forEach(function(btn) { btn.classList.remove('active'); });
    if (mode === 'flashcard') studyModeFlashcard.classList.add('active');
    else if (mode === 'fillblank') studyModeFillblank.classList.add('active');
    else studyModeTyping.classList.add('active');
    render();
  }

  // Dark mode
  function toggleDarkMode() {
    settings.darkMode = !settings.darkMode;
    document.body.classList.toggle('dark', settings.darkMode);
    darkModeBtn.classList.toggle('active', settings.darkMode);
    darkModeBtn.textContent = settings.darkMode ? '☀️' : '🌙';
    saveSettings();
  }

  // Search
  function handleSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    currentIndex = 0;
    render();
  }

  // Recycle bin
  function showRecycleModal() {
    recycleModal.classList.add('show');
    renderRecycleList();
  }

  function hideRecycleModal() {
    recycleModal.classList.remove('show');
  }

  function renderRecycleList() {
    if (!recycleList) return;
    if (recycleBin.length === 0) {
      recycleList.innerHTML = '<div class="weak-empty">回收站是空的</div>';
      return;
    }
    recycleList.innerHTML = '';
    for (var i = 0; i < recycleBin.length; i++) {
      var q = recycleBin[i];
      var item = document.createElement('div');
      item.className = 'manage-item';
      (function(qid) {
        item.innerHTML =
          '<div class="manage-item-content">' +
            '<div class="manage-item-chapter">' + escapeHtml(q.chapter) + '</div>' +
            '<div class="manage-item-q">' + escapeHtml(q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question) + '</div>' +
          '</div>' +
          '<button class="btn btn-outline" style="font-size:0.8rem;padding:4px 10px;">恢复</button>';
        item.querySelector('button').onclick = function(e) {
          e.stopPropagation();
          restoreFromRecycleBin(qid);
          renderRecycleList();
          render();
        };
      })(q.id);
      recycleList.appendChild(item);
    }
  }

  function emptyRecycleBin() {
    if (recycleBin.length === 0) return;
    if (!confirm('确定永久删除回收站中的 ' + recycleBin.length + ' 道题目吗？此操作不可恢复。')) return;
    recycleBin = [];
    saveRecycleBin();
    renderRecycleList();
  }

  function restoreAllRecycleBin() {
    if (recycleBin.length === 0) return;
    for (var i = recycleBin.length - 1; i >= 0; i--) {
      var q = recycleBin[i];
      QUESTIONS.push(q);
      recycleBin.splice(i, 1);
    }
    saveRecycleBin();
    saveImportedQuestions();
    renderRecycleList();
    render();
  }

  function resetProgress() {
    if (confirm('确定要重置所有学习进度吗？')) {
      state = { marked: [], viewed: [], mastered: [], learnedCounts: {}, lastIndex: 0 };
      typingAnswers = {};
      saveState();
      currentIndex = 0;
      render();
    }
  }

  function toggleShuffle() {
    shuffled = !shuffled;
    shuffleBtn.innerHTML = shuffled ? '<span class="tool-icon">📋</span>顺序' : '<span class="tool-icon">🔀</span>随机';
    currentIndex = 0;
    render();
  }

  function resetViewed() {
    state.viewed = [];
    saveState();
    render();
  }

  function toggleViewed(qid) {
    var idx = state.viewed.indexOf(qid);
    if (idx === -1) {
      state.viewed.push(qid);
    } else {
      state.viewed.splice(idx, 1);
    }
    saveState();
    render();
  }

  // ============================================
  // Export
  // ============================================
  function showExportModal() { exportModal.classList.add('show'); exportPreview.style.display = 'none'; }
  function hideExportModal() { exportModal.classList.remove('show'); }

  function exportAs(format) {
    var all = getAllQuestions();
    var mq = all.filter(function(q) { return state.marked.includes(q.id); });
    if (mq.length === 0) { exportPreview.style.display = 'block'; exportPreview.textContent = '没有标记的题目可以导出'; return; }
    var content = '';
    if (format === 'txt') {
      content = '=== 标记题目导出 ===\n\n';
      mq.forEach(function(q, i) { content += '【第' + (i+1) + '题】' + q.question + '\n\n' + q.answer + '\n\n'; if (q.source) content += '来源：' + q.source + '\n'; content += '\n' + '─'.repeat(50) + '\n\n'; });
    } else if (format === 'md') {
      content = '# 标记题目导出\n\n';
      mq.forEach(function(q, i) { content += '## ' + (i+1) + '. ' + q.question + '\n\n' + q.answer + '\n\n'; if (q.source) content += '> 📚 ' + q.source + '\n\n'; content += '---\n\n'; });
    } else if (format === 'anki') {
      content = 'Question\tAnswer\tTags\n';
      mq.forEach(function(q) { content += q.question.replace(/\t/g, ' ').replace(/\n/g, '<br>') + '\t' + q.answer.replace(/\t/g, ' ').replace(/\n/g, '<br>') + '\t中气象学\n'; });
    }
    exportPreview.style.display = 'block'; exportPreview.textContent = content;
    var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = '标记题目_' + new Date().toLocaleDateString() + '.' + (format === 'anki' ? 'csv' : format);
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // ============================================
  // Import
  // ============================================
  var importParsed = [];

  function showImportModal() {
    importModal.classList.add('show');
    importTextarea.value = '';
    importPreviewDiv.innerHTML = '';
    importPreviewDiv.style.display = 'none';
    importConfirmBtn.style.display = 'none';
    importParsed = [];
    if (importRulesContent) importRulesContent.style.display = 'none';
  }

  function hideImportModal() {
    importModal.classList.remove('show');
  }

  function toggleImportRules() {
    if (!importRulesContent) return;
    importRulesContent.style.display = importRulesContent.style.display === 'none' ? 'block' : 'none';
  }

  function parseImportText(text) {
    var questions = [];
    if (!text.trim()) return questions;

    // Detect format: if contains "Q:" or "A:" -> format 1, else -> format 2
    var isQAFormat = /(?:^|\n)\s*Q[:：]/m.test(text);

    var blocks = text.split(/\n---\n|\n---$|^---\n/);

    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b].trim();
      if (!block) continue;

      var chapter = '未分类';
      var question = '';
      var answer = '';
      var source = '';

      // Extract chapter (# at beginning)
      var chapterMatch = block.match(/^#\s*(.+)\n/);
      if (chapterMatch) {
        chapter = chapterMatch[1].trim();
        block = block.substring(chapterMatch[0].length).trim();
      }

      if (isQAFormat) {
        // Format 1: Q: / A: tags
        var qMatch = block.match(/(?:^|\n)\s*Q[:：]\s*([\s\S]*?)(?=\n\s*A[:：]|$)/);
        var aMatch = block.match(/(?:^|\n)\s*A[:：]\s*([\s\S]*?)(?=\n\s*来源[:：]|$)/);
        var sMatch = block.match(/(?:^|\n)\s*来源[:：]\s*([\s\S]*?)$/);

        if (qMatch) question = qMatch[1].trim();
        if (aMatch) answer = aMatch[1].trim();
        if (sMatch) source = sMatch[1].trim();
      } else {
        // Format 2: === separator
        var parts = block.split(/\n===\n|\n===$|^===\n/);
        if (parts.length >= 2) {
          question = parts[0].trim();
          answer = parts[1].trim();
        } else {
          // Single block, treat as question only (skip)
          continue;
        }
      }

      if (question && answer) {
        questions.push({
          chapter: chapter,
          question: question,
          answer: answer,
          source: source
        });
      }
    }

    return questions;
  }

  function previewImport() {
    var text = importTextarea.value;
    importParsed = parseImportText(text);

    if (importParsed.length === 0) {
      importPreviewDiv.innerHTML = '<div class="import-error">没有解析到有效题目，请检查格式。</div>';
      importPreviewDiv.style.display = 'block';
      importConfirmBtn.style.display = 'none';
      return;
    }

    var subject = importSubject.value.trim() || '未分类';
    var html = '<div class="import-count">科目: ' + escapeHtml(subject) + ' | 解析到 ' + importParsed.length + ' 道题目</div>';
    html += '<div class="import-list">';
    for (var i = 0; i < importParsed.length; i++) {
      var q = importParsed[i];
      html += '<div class="import-item">';
      html += '<div class="import-item-chapter">' + escapeHtml(q.chapter) + '</div>';
      html += '<div class="import-item-q">' + escapeHtml(q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    importPreviewDiv.innerHTML = html;
    importPreviewDiv.style.display = 'block';
    importConfirmBtn.style.display = 'inline-flex';
  }

  function confirmImport() {
    if (importParsed.length === 0) return;

    var subject = importSubject.value.trim() || '未分类';

    // Find max id
    var maxId = 0;
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (QUESTIONS[i].id > maxId) maxId = QUESTIONS[i].id;
    }

    // Add questions
    var count = 0;
    for (var j = 0; j < importParsed.length; j++) {
      var newId = maxId + j + 1;
      var newQ = {
        id: newId,
        subject: subject,
        chapter: importParsed[j].chapter,
        question: importParsed[j].question,
        answer: importParsed[j].answer,
        source: importParsed[j].source
      };
      QUESTIONS.push(newQ);

      // Mark as custom
      edits[newId] = {
        subject: subject,
        chapter: importParsed[j].chapter,
        question: importParsed[j].question,
        answer: importParsed[j].answer,
        source: importParsed[j].source,
        custom: true
      };
      count++;
    }

    saveEdits();
    saveImportedQuestions();
    hideImportModal();
    importSubject.value = '';
    populateSubjectSelect();
    populateChapterSelect();
    render();
    alert('成功导入 ' + count + ' 道题目！');
  }

  // ============================================
  // Manage Questions
  // ============================================
  var manageSelected = new Set();

  var manageSubjectFilterVal = 'all';

  function populateManageSubjectDropdowns() {
    var subjects = {};
    for (var i = 0; i < QUESTIONS.length; i++) {
      var s = getQuestionSubject(QUESTIONS[i]) || '未分类';
      subjects[s] = true;
    }
    var keys = Object.keys(subjects);

    // Filter dropdown
    var filterVal = manageSubjectFilter.value;
    manageSubjectFilter.innerHTML = '<option value="all">全部科目</option>';
    for (var j = 0; j < keys.length; j++) {
      var opt = document.createElement('option');
      opt.value = keys[j];
      opt.textContent = keys[j];
      manageSubjectFilter.appendChild(opt);
    }
    if (filterVal && filterVal !== 'all' && subjects[filterVal]) {
      manageSubjectFilter.value = filterVal;
    } else {
      manageSubjectFilter.value = 'all';
    }

    // Existing subject dropdown
    manageExistingSubject.innerHTML = '<option value="">选择已有科目...</option>';
    for (var k = 0; k < keys.length; k++) {
      var opt2 = document.createElement('option');
      opt2.value = keys[k];
      opt2.textContent = keys[k];
      manageExistingSubject.appendChild(opt2);
    }
  }

  function showManageModal() {
    manageModal.classList.add('show');
    manageSelected.clear();
    manageSubjectFilterVal = 'all';
    populateManageSubjectDropdowns();
    renderManageList();
  }

  function hideManageModal() {
    manageModal.classList.remove('show');
  }

  function renderManageList() {
    if (!manageList) return;
    manageList.innerHTML = '';

    var all = getAllQuestions();
    for (var i = 0; i < all.length; i++) {
      var q = all[i];
      var subj = q.subject || '未分类';

      // Filter by subject
      if (manageSubjectFilterVal !== 'all' && subj !== manageSubjectFilterVal) continue;

      var isCustom = edits[q.id] && edits[q.id].custom;
      var isEdited = edits[q.id] && !edits[q.id].custom;

      var item = document.createElement('div');
      item.className = 'manage-item';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = manageSelected.has(q.id);
      checkbox.setAttribute('data-id', q.id);
      (function(qid, cb) {
        cb.addEventListener('change', function() {
          if (cb.checked) manageSelected.add(qid);
          else manageSelected.delete(qid);
        });
      })(q.id, checkbox);

      var content = document.createElement('div');
      content.className = 'manage-item-content';

      var chapter = document.createElement('div');
      chapter.className = 'manage-item-chapter';
      chapter.textContent = subj + ' · ' + q.chapter;

      var questionText = document.createElement('div');
      questionText.className = 'manage-item-q';
      questionText.textContent = q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question;

      content.appendChild(chapter);
      content.appendChild(questionText);

      var tag = document.createElement('span');
      tag.className = 'manage-item-tag';
      if (isCustom) {
        tag.className += ' custom';
        tag.textContent = '导入';
      } else if (isEdited) {
        tag.className += ' edited';
        tag.textContent = '已改';
      } else {
        tag.className += ' original';
        tag.textContent = '原始';
      }

      item.appendChild(checkbox);
      item.appendChild(content);
      item.appendChild(tag);
      manageList.appendChild(item);
    }
  }

  function manageMoveSubjectFn() {
    if (manageSelected.size === 0) {
      alert('请先选择要移动的题目');
      return;
    }
    var newSubject = manageNewSubject.value.trim() || manageExistingSubject.value;
    if (!newSubject) {
      alert('请输入新科目名或选择已有科目');
      return;
    }

    var count = 0;
    manageSelected.forEach(function(qid) {
      // Update in QUESTIONS
      for (var i = 0; i < QUESTIONS.length; i++) {
        if (QUESTIONS[i].id === qid) {
          QUESTIONS[i].subject = newSubject;
          break;
        }
      }
      // Update in edits
      if (!edits[qid]) {
        edits[qid] = {};
      }
      edits[qid].subject = newSubject;
      count++;
    });

    saveEdits();
    saveImportedQuestions();
    populateSubjectSelect();
    populateChapterSelect();
    populateManageSubjectDropdowns();
    renderManageList();
    manageNewSubject.value = '';
    manageExistingSubject.value = '';
    alert('已将 ' + count + ' 道题目移至「' + newSubject + '」');
  }

  function manageSelectAllFn() {
    var all = getAllQuestions();
    for (var i = 0; i < all.length; i++) {
      manageSelected.add(all[i].id);
    }
    renderManageList();
  }

  function manageSelectNoneFn() {
    manageSelected.clear();
    renderManageList();
  }

  function manageSelectCustomFn() {
    manageSelected.clear();
    var all = getAllQuestions();
    for (var i = 0; i < all.length; i++) {
      if (edits[all[i].id] && edits[all[i].id].custom) {
        manageSelected.add(all[i].id);
      }
    }
    renderManageList();
  }

  function deleteQuestionsByIds(ids) {
    for (var i = 0; i < ids.length; i++) {
      var qid = ids[i];
      // Find and move to recycle bin
      for (var j = QUESTIONS.length - 1; j >= 0; j--) {
        if (QUESTIONS[j].id === qid) {
          addToRecycleBin(QUESTIONS[j]);
          QUESTIONS.splice(j, 1);
          break;
        }
      }
      // Remove from edits
      delete edits[qid];
      // Remove from notes
      delete notes[qid];
      // Remove from state
      var markedIdx = state.marked.indexOf(qid);
      if (markedIdx !== -1) state.marked.splice(markedIdx, 1);
      var viewedIdx = state.viewed.indexOf(qid);
      if (viewedIdx !== -1) state.viewed.splice(viewedIdx, 1);
      if (state.mastered) {
        var masteredIdx = state.mastered.indexOf(qid);
        if (masteredIdx !== -1) state.mastered.splice(masteredIdx, 1);
      }
      // Remove from learnedCounts
      if (state.learnedCounts) {
        delete state.learnedCounts[qid];
      }
    }
    saveEdits();
    saveNotes();
    saveState();
    saveImportedQuestions();
  }

  function manageDeleteSelectedFn() {
    if (manageSelected.size === 0) {
      alert('请先选择要删除的题目');
      return;
    }
    if (!confirm('确定删除选中的 ' + manageSelected.size + ' 道题目吗？')) return;

    var ids = [];
    manageSelected.forEach(function(id) { ids.push(id); });
    deleteQuestionsByIds(ids);

    manageSelected.clear();
    if (currentIndex > 0) currentIndex--;
    renderManageList();
    populateSubjectSelect();
    populateChapterSelect();
    render();
  }

  function manageDeleteAllCustomFn() {
    var customIds = [];
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (edits[QUESTIONS[i].id] && edits[QUESTIONS[i].id].custom) {
        customIds.push(QUESTIONS[i].id);
      }
    }
    if (customIds.length === 0) {
      alert('没有导入的题目');
      return;
    }
    if (!confirm('确定删除全部 ' + customIds.length + ' 道导入题目吗？')) return;

    deleteQuestionsByIds(customIds);

    manageSelected.clear();
    if (currentIndex > 0) currentIndex--;
    hideManageModal();
    populateSubjectSelect();
    populateChapterSelect();
    render();
  }

  // ============================================
  // Event Listeners
  // ============================================
  cardFront.addEventListener('click', flipCard);
  cardBack.addEventListener('click', flipCard);
  nextBtn.addEventListener('click', nextQuestion);
  prevBtn.addEventListener('click', prevQuestion);
  markBtn.addEventListener('click', toggleMark);
  editBtn.addEventListener('click', openEdit);
  resetBtn.addEventListener('click', resetProgress);
  shuffleBtn.addEventListener('click', toggleShuffle);
  exportBtn.addEventListener('click', showExportModal);
  modalClose.addEventListener('click', hideExportModal);
  exportModal.addEventListener('click', function(e) { if (e.target === exportModal) hideExportModal(); });
  exportTxt.addEventListener('click', function() { exportAs('txt'); });
  exportMd.addEventListener('click', function() { exportAs('md'); });
  exportAnki.addEventListener('click', function() { exportAs('anki'); });
  modeAll.addEventListener('click', function() { setMode('all'); });
  modeMarked.addEventListener('click', function() { setMode('marked'); });
  modeUnseen.addEventListener('click', function() { setMode('unseen'); });
  modeLearned.addEventListener('click', function() { setMode('learned'); });

  // Study mode
  studyModeFlashcard.addEventListener('click', function() { setStudyMode('flashcard'); });
  studyModeFillblank.addEventListener('click', function() { setStudyMode('fillblank'); });
  studyModeTyping.addEventListener('click', function() { setStudyMode('typing'); });

  // Edit modal
  editModalClose.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', function(e) { if (e.target === editModal) closeEditModal(); });
  editSaveBtn.addEventListener('click', saveEdit);
  editResetBtn.addEventListener('click', resetEdit);
  editDeleteBtn.addEventListener('click', deleteQuestion);
  editAddBtn.addEventListener('click', addNewQuestion);

  // Import modal
  importBtn.addEventListener('click', showImportModal);
  resetViewedBtn.addEventListener('click', resetViewed);
  importModalClose.addEventListener('click', hideImportModal);
  importModal.addEventListener('click', function(e) { if (e.target === importModal) hideImportModal(); });
  importPreviewBtn.addEventListener('click', previewImport);
  importConfirmBtn.addEventListener('click', confirmImport);
  if (importRulesBtn) importRulesBtn.addEventListener('click', toggleImportRules);

  // Manage modal
  manageBtn.addEventListener('click', showManageModal);
  manageModalClose.addEventListener('click', hideManageModal);
  manageModal.addEventListener('click', function(e) { if (e.target === manageModal) hideManageModal(); });
  manageSelectAll.addEventListener('click', manageSelectAllFn);
  manageSelectNone.addEventListener('click', manageSelectNoneFn);
  manageSelectCustom.addEventListener('click', manageSelectCustomFn);
  manageDeleteSelected.addEventListener('click', manageDeleteSelectedFn);
  manageDeleteAllCustom.addEventListener('click', manageDeleteAllCustomFn);
  manageSubjectFilter.addEventListener('change', function() {
    manageSubjectFilterVal = manageSubjectFilter.value;
    renderManageList();
  });
  manageMoveBtn.addEventListener('click', manageMoveSubjectFn);

  // New features
  darkModeBtn.addEventListener('click', toggleDarkMode);
  searchInput.addEventListener('input', handleSearch);
  modeMastered.addEventListener('click', function() { setMode('mastered'); });
  masteredBtn.addEventListener('click', toggleMastered);
  learnedDownBtn.addEventListener('click', decreaseLearned);
  learnedUpBtn.addEventListener('click', increaseLearned);
  recycleBinBtn.addEventListener('click', showRecycleModal);
  recycleModalClose.addEventListener('click', hideRecycleModal);
  recycleModal.addEventListener('click', function(e) { if (e.target === recycleModal) hideRecycleModal(); });
  recycleEmptyBtn.addEventListener('click', emptyRecycleBin);
  recycleRestoreAllBtn.addEventListener('click', restoreAllRecycleBin);

  // More dropdown menu
  var moreBtn = document.getElementById('moreBtn');
  var moreDropdown = document.getElementById('moreDropdown');
  moreBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    moreDropdown.classList.toggle('show');
  });
  document.addEventListener('click', function(e) {
    if (!moreDropdown.contains(e.target) && e.target !== moreBtn) {
      moreDropdown.classList.remove('show');
    }
  });
  // Close dropdown when selecting an item
  editBtn.addEventListener('click', function() { moreDropdown.classList.remove('show'); });
  masteredBtn.addEventListener('click', function() { moreDropdown.classList.remove('show'); });

  // Subject filter
  subjectSelect.addEventListener('change', function() {
    currentSubject = subjectSelect.value;
    currentChapter = 'all';
    currentIndex = 0;
    populateChapterSelect();
    render();
  });

  // Subject Tree Modal
  var stExpanded = {};

  function openSubjectTree() {
    subjectTreeModal.classList.add('show');
    stAddInput.value = '';
    renderSubjectTree();
  }

  function closeSubjectTree() {
    subjectTreeModal.classList.remove('show');
  }

  function renderSubjectTree() {
    stTree.innerHTML = '';
    var tree = {};
    var subjectOrder = [];
    for (var i = 0; i < QUESTIONS.length; i++) {
      var q = QUESTIONS[i];
      var subj = getQuestionSubject(q) || '未分类';
      var ch = (edits[q.id] && edits[q.id].chapter) || q.chapter || '未分类';
      if (!tree[subj]) { tree[subj] = {}; subjectOrder.push(subj); }
      if (!tree[subj][ch]) tree[subj][ch] = [];
      tree[subj][ch].push(q);
    }

    for (var si = 0; si < subjectOrder.length; si++) {
      var subjName = subjectOrder[si];
      var chapters = tree[subjName];
      var chKeys = Object.keys(chapters);
      var totalQ = 0;
      for (var ck = 0; ck < chKeys.length; ck++) totalQ += chapters[chKeys[ck]].length;

      var subjDiv = document.createElement('div');
      subjDiv.className = 'st-subject';
      var subjHd = document.createElement('div');
      subjHd.className = 'st-subject-hd';
      var arrow = document.createElement('span');
      arrow.className = 'st-arrow' + (stExpanded['s:'+subjName] ? ' expanded' : '');
      arrow.textContent = '▶';
      var label = document.createElement('span');
      label.className = 'st-label';
      label.textContent = subjName;
      var badge = document.createElement('span');
      badge.className = 'st-badge';
      badge.textContent = totalQ + '题';
      var renameBtn = document.createElement('button');
      renameBtn.className = 'st-rename-btn';
      renameBtn.textContent = '重命名';
      (function(sn) {
        renameBtn.onclick = function(e) {
          e.stopPropagation();
          var newName = prompt('重命名「' + sn + '」为：', sn);
          if (!newName || newName === sn) return;
          renameSubject(sn, newName);
        };
      })(subjName);
      var delBtn = document.createElement('button');
      delBtn.className = 'st-del-btn';
      delBtn.textContent = '✕';
      delBtn.title = '删除整个科目';
      (function(sn, cnt) {
        delBtn.onclick = function(e) {
          e.stopPropagation();
          if (!confirm('删除科目「' + sn + '」？' + cnt + ' 道题目将被移入回收站。')) return;
          deleteSubject(sn);
        };
      })(subjName, totalQ);

      subjHd.appendChild(arrow);
      subjHd.appendChild(label);
      subjHd.appendChild(badge);
      subjHd.appendChild(renameBtn);
      subjHd.appendChild(delBtn);

      var subjBody = document.createElement('div');
      subjBody.className = 'st-body' + (stExpanded['s:'+subjName] ? ' expanded' : '');

      for (var ci = 0; ci < chKeys.length; ci++) {
        var chName = chKeys[ci];
        var questions = chapters[chName];
        var chDiv = document.createElement('div');
        chDiv.className = 'st-chapter';
        var chHd = document.createElement('div');
        chHd.className = 'st-chapter-hd';
        var chArrow = document.createElement('span');
        chArrow.className = 'st-arrow' + (stExpanded['c:'+subjName+':'+chName] ? ' expanded' : '');
        chArrow.textContent = '▶';
        var chLabel = document.createElement('span');
        chLabel.className = 'st-chapter-name';
        chLabel.textContent = chName;
        var chBadge = document.createElement('span');
        chBadge.className = 'st-badge';
        chBadge.textContent = questions.length;
        var chDelBtn = document.createElement('button');
        chDelBtn.className = 'st-del-btn';
        chDelBtn.textContent = '✕';
        chDelBtn.title = '删除整个章节';
        (function(sn, cn, cnt) {
          chDelBtn.onclick = function(e) {
            e.stopPropagation();
            if (!confirm('删除章节「' + cn + '」？' + cnt + ' 道题目将被移入回收站。')) return;
            deleteChapter(sn, cn);
          };
        })(subjName, chName, questions.length);

        chHd.appendChild(chArrow);
        chHd.appendChild(chLabel);
        chHd.appendChild(chBadge);
        chHd.appendChild(chDelBtn);

        var qDiv = document.createElement('div');
        qDiv.className = 'st-questions' + (stExpanded['c:'+subjName+':'+chName] ? ' expanded' : '');
        for (var qi = 0; qi < questions.length; qi++) {
          var qq = questions[qi];
          var qText = (edits[qq.id] && edits[qq.id].question) || qq.question;
          var qItem = document.createElement('div');
          qItem.className = 'st-q-item';
          var qSpan = document.createElement('span');
          qSpan.className = 'st-q-text';
          qSpan.textContent = qText.length > 30 ? qText.substring(0, 30) + '...' : qText;
          var qDel = document.createElement('button');
          qDel.className = 'st-q-del';
          qDel.textContent = '✕';
          (function(qid) {
            qDel.onclick = function(e) {
              e.stopPropagation();
              deleteSingleQuestionST(qid);
            };
          })(qq.id);
          qItem.appendChild(qSpan);
          qItem.appendChild(qDel);
          qDiv.appendChild(qItem);
        }

        (function(cn, sn, hd, arr, body) {
          hd.onclick = function() {
            var key = 'c:'+sn+':'+cn;
            stExpanded[key] = !stExpanded[key];
            arr.classList.toggle('expanded', stExpanded[key]);
            body.classList.toggle('expanded', stExpanded[key]);
          };
        })(chName, subjName, chHd, chArrow, qDiv);

        chDiv.appendChild(chHd);
        chDiv.appendChild(qDiv);
        subjBody.appendChild(chDiv);
      }

      (function(sn, hd, arr, body) {
        hd.onclick = function() {
          stExpanded['s:'+sn] = !stExpanded['s:'+sn];
          arr.classList.toggle('expanded', stExpanded['s:'+sn]);
          body.classList.toggle('expanded', stExpanded['s:'+sn]);
        };
      })(subjName, subjHd, arrow, subjBody);

      subjDiv.appendChild(subjHd);
      subjDiv.appendChild(subjBody);
      stTree.appendChild(subjDiv);
    }
  }

  function renameSubject(oldName, newName) {
    for (var i = 0; i < QUESTIONS.length; i++) {
      if ((getQuestionSubject(QUESTIONS[i]) || '未分类') === oldName) {
        if (!edits[QUESTIONS[i].id]) edits[QUESTIONS[i].id] = {};
        edits[QUESTIONS[i].id].subject = newName;
      }
    }
    saveEdits(); saveImportedQuestions();
    if (currentSubject === oldName) currentSubject = newName;
    populateSubjectSelect(); populateChapterSelect();
    renderSubjectTree(); render();
  }

  function deleteSubject(subjName) {
    var ids = [];
    for (var i = 0; i < QUESTIONS.length; i++) {
      if ((getQuestionSubject(QUESTIONS[i]) || '未分类') === subjName) ids.push(QUESTIONS[i].id);
    }
    batchDeleteQuestions(ids);
    if (currentSubject === subjName) currentSubject = 'all';
    populateSubjectSelect(); populateChapterSelect();
    renderSubjectTree(); render();
  }

  function deleteChapter(subjName, chName) {
    var ids = [];
    for (var i = 0; i < QUESTIONS.length; i++) {
      var s = getQuestionSubject(QUESTIONS[i]) || '未分类';
      var c = (edits[QUESTIONS[i].id] && edits[QUESTIONS[i].id].chapter) || QUESTIONS[i].chapter || '未分类';
      if (s === subjName && c === chName) ids.push(QUESTIONS[i].id);
    }
    batchDeleteQuestions(ids);
    populateSubjectSelect(); populateChapterSelect();
    renderSubjectTree(); render();
  }

  function deleteSingleQuestionST(qid) {
    batchDeleteQuestions([qid]);
    populateSubjectSelect(); populateChapterSelect();
    renderSubjectTree(); render();
  }

  function batchDeleteQuestions(ids) {
    for (var i = 0; i < ids.length; i++) {
      var qid = ids[i];
      for (var j = QUESTIONS.length - 1; j >= 0; j--) {
        if (QUESTIONS[j].id === qid) { recycleBin.push(QUESTIONS[j]); QUESTIONS.splice(j, 1); break; }
      }
      delete edits[qid]; delete notes[qid];
      var m = state.marked.indexOf(qid); if (m !== -1) state.marked.splice(m, 1);
      var v = state.viewed.indexOf(qid); if (v !== -1) state.viewed.splice(v, 1);
      if (state.mastered) { var ma = state.mastered.indexOf(qid); if (ma !== -1) state.mastered.splice(ma, 1); }
      if (state.learnedCounts) delete state.learnedCounts[qid];
    }
    if (currentIndex > 0) currentIndex -= Math.min(currentIndex, ids.length);
    saveState(); saveEdits(); saveNotes(); saveRecycleBin(); saveImportedQuestions();
  }

  stAddBtn.addEventListener('click', function() {
    var name = stAddInput.value.trim();
    if (!name) { alert('请输入科目名称'); return; }
    for (var i = 0; i < QUESTIONS.length; i++) {
      if (getQuestionSubject(QUESTIONS[i]) === name) { alert('科目「' + name + '」已存在'); return; }
    }
    var maxId = 0;
    for (var j = 0; j < QUESTIONS.length; j++) { if (QUESTIONS[j].id > maxId) maxId = QUESTIONS[j].id; }
    var newQ = { id: maxId + 1, subject: name, chapter: '未分类', question: '（空题目，可删除）', answer: '请添加内容', source: '' };
    QUESTIONS.push(newQ);
    edits[newQ.id] = { subject: name, chapter: '未分类', question: newQ.question, answer: newQ.answer, source: '', custom: true };
    saveEdits(); saveImportedQuestions();
    stExpanded['s:'+name] = true;
    populateSubjectSelect(); populateChapterSelect();
    stAddInput.value = '';
    renderSubjectTree(); render();
  });

  manageSubjectBtn.addEventListener('click', openSubjectTree);
  subjectTreeClose.addEventListener('click', closeSubjectTree);
  subjectTreeModal.addEventListener('click', function(e) { if (e.target === subjectTreeModal) closeSubjectTree(); });

  // Chapter filter
  chapterSelect.addEventListener('change', function() {
    currentChapter = chapterSelect.value;
    currentIndex = 0;
    render();
  });

  // Learned popup - mobile tap toggle
  learnedBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (window.innerWidth <= 768) {
      learnedPopup.classList.toggle('show');
    } else {
      increaseLearned();
    }
  });
  document.addEventListener('click', function(e) {
    if (!learnedWrapper.contains(e.target)) {
      learnedPopup.classList.remove('show');
    }
  });

  // Sidebar toggle
  menuBtn.addEventListener('click', function() { sidebar.classList.add('open'); });
  sidebarClose.addEventListener('click', function() { sidebar.classList.remove('open'); });

  // About modal
  aboutBtn.addEventListener('click', function() { aboutModal.classList.add('show'); });
  aboutClose.addEventListener('click', function() { aboutModal.classList.remove('show'); });
  aboutModal.addEventListener('click', function(e) { if (e.target === aboutModal) aboutModal.classList.remove('show'); });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch(e.key) {
      case 'ArrowLeft': e.preventDefault(); prevQuestion(); break;
      case 'ArrowRight': e.preventDefault(); nextQuestion(); break;
      case ' ': e.preventDefault(); flipCard(); break;
      case 'm': case 'M': e.preventDefault(); toggleMark(); break;
      case 'e': case 'E': e.preventDefault(); openEdit(); break;
      case 'l': case 'L': e.preventDefault(); increaseLearned(); break;
    }
  });

  // Touch/swipe
  var touchStartX = 0, touchStartY = 0;
  card.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; }, { passive: true });
  card.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) { if (dx > 0) prevQuestion(); else nextQuestion(); }
  }, { passive: true });

  // ============================================
  // Initialize
  // ============================================
  loadImportedQuestions();
  populateSubjectSelect();
  populateChapterSelect();

  // Apply saved settings
  if (settings.darkMode) {
    document.body.classList.add('dark');
    darkModeBtn.classList.add('active');
    darkModeBtn.textContent = '☀️';
  }

  render();

})();
