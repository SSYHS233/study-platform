import sys, json
sys.stdout.reconfigure(encoding='utf-8')

with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Read import rules
with open('import-rules.txt', 'r', encoding='utf-8') as f:
    rules = f.read()

# Escape rules for embedding in HTML
rules_escaped = rules.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSYHS背题吧</title>
  <style>
''' + css + '''
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">📝 SSYHS背题吧</h1>
        <button class="sidebar-close" id="sidebarClose">&times;</button>
      </div>
      <div class="sidebar-section">
        <h3>筛选模式</h3>
        <div class="mode-buttons">
          <button class="mode-btn active" id="modeAll">全部题目 <span class="count-hint" id="allCountHint"></span></button>
          <button class="mode-btn" id="modeMarked">标记题目 <span class="badge badge-brown" id="markedBadge">0</span></button>
          <button class="mode-btn" id="modeUnseen">未学习 <span class="badge" id="unseenBadge">0</span></button>
          <button class="mode-btn" id="modeLearned">已学习 <span class="badge badge-accent" id="learnedBadge">0</span></button>
          <button class="mode-btn" id="modeMastered">不背了 <span class="badge badge-muted" id="masteredBadge">0</span></button>
        </div>
      </div>
      <div class="search-box">
        <input type="text" class="search-input" id="searchInput" placeholder="🔍 搜索题目或答案...">
      </div>
      <div class="sidebar-section">
        <h3>题目列表</h3>
        <div class="question-list" id="questionList"></div>
      </div>
      <div class="sidebar-section">
        <h3>学习统计</h3>
        <div class="stats-grid">
          <div class="stat-item"><div class="stat-number" id="statTotal">0</div><div class="stat-label">总题数</div></div>
          <div class="stat-item"><div class="stat-number" id="statViewed">0</div><div class="stat-label">已学习 <button class="stat-reset-btn" id="resetViewedBtn" title="重置已学习状态">↻</button></div></div>
          <div class="stat-item"><div class="stat-number" id="statMarked">0</div><div class="stat-label">需复习</div></div>
          <div class="stat-item"><div class="stat-number" id="statProgress">0%</div><div class="stat-label">完成率</div></div>
        </div>
        <div class="progress-bar-container"><div class="progress-bar" id="progressBar"></div></div>
      </div>
      <div class="sidebar-section">
        <button class="btn btn-outline btn-full" id="importBtn">📥 批量导入题目</button>
        <button class="btn btn-outline btn-full" id="manageBtn">📋 管理题目</button>
        <button class="btn btn-outline btn-full" id="exportBtn">📤 导出标记题</button>
        <button class="btn btn-outline btn-full" id="shuffleBtn">🔀 随机顺序</button>
        <button class="btn btn-outline btn-full" id="recycleBinBtn">♻️ 回收站</button>
        <button class="btn btn-outline btn-full" id="resetBtn">🗑️ 重置学习进度</button>
      </div>
    </aside>
    <main class="main">
      <div class="topbar">
        <button class="menu-btn" id="menuBtn">☰</button>
        <div class="topbar-title" id="topbarTitle">全部题目</div>
        <div class="topbar-counter" id="topbarCounter">1 / 30</div>
        <div class="topbar-controls">
          <button class="topbar-icon-btn" id="darkModeBtn" title="深色模式">🌙</button>
        </div>
      </div>
      <div class="study-mode-bar">
        <button class="study-mode-btn active" id="studyModeFlashcard">📇 闪卡</button>
        <button class="study-mode-btn" id="studyModeFillblank">✏️ 填空</button>
        <button class="study-mode-btn" id="studyModeTyping">✍️ 默写</button>
      </div>
      <div class="card-area">
        <div class="card-container">
          <div class="card" id="card">
            <div class="card-front" id="cardFront">
              <div class="card-chapter" id="cardChapter"></div>
              <div class="card-question" id="cardQuestion"></div>
              <div class="card-hint">点击卡片查看答案</div>
            </div>
            <div class="card-back" id="cardBack">
              <div class="card-answer-label">答案</div>
              <div class="card-answer" id="cardAnswer"></div>
              <div class="card-source" id="cardSource"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="fill-blank-area" id="fillBlankArea"></div>
      <div class="typing-area" id="typingArea"></div>
      <div class="action-bar">
        <div class="action-row">
          <button class="action-btn action-prev" id="prevBtn"><span class="action-icon">◀</span><span class="action-text">上一题</span></button>
          <button class="action-btn action-flip" id="flipBtn"><span class="action-icon">🔄</span><span class="action-text" id="flipText">翻转</span></button>
          <button class="action-btn action-mark" id="markBtn"><span class="action-icon">⭐</span><span class="action-text" id="markText">标记</span></button>
          <button class="action-btn action-learned-down" id="learnedDownBtn"><span class="action-icon">−</span></button>
          <button class="action-btn action-learned" id="learnedBtn"><span class="action-icon">📚</span><span class="action-text" id="learnedText">背了</span></button>
          <button class="action-btn action-learned-up" id="learnedUpBtn"><span class="action-icon">+</span></button>
          <button class="action-btn action-edit" id="editBtn"><span class="action-icon">✏️</span><span class="action-text">编辑</span></button>
          <button class="action-btn action-next" id="nextBtn"><span class="action-text">下一题</span><span class="action-icon">▶</span></button>
          <button class="action-btn action-mastered" id="masteredBtn"><span class="action-icon">✅</span><span class="action-text" id="masteredText">不背了</span></button>
        </div>
        <div class="keyboard-hint">快捷键: ← 上一题 | 空格 翻转 | M 标记 | L 背了 | E 编辑 | → 下一题</div>
      </div>
    </main>
  </div>

  <!-- Export Modal -->
  <div class="modal-overlay" id="exportModal">
    <div class="modal">
      <div class="modal-header"><h2>导出标记题目</h2><button class="modal-close" id="modalClose">&times;</button></div>
      <div class="modal-body">
        <div class="export-options">
          <button class="btn btn-primary" id="exportTxt">导出为 TXT</button>
          <button class="btn btn-primary" id="exportMd">导出为 Markdown</button>
          <button class="btn btn-primary" id="exportAnki">导出为 Anki CSV</button>
        </div>
        <div class="export-preview" id="exportPreview"></div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div class="modal-overlay edit-modal" id="editModal">
    <div class="modal">
      <div class="modal-header"><h2>编辑题目</h2><button class="modal-close" id="editModalClose">&times;</button></div>
      <div class="modal-body">
        <div class="edit-form">
          <div class="edit-field">
            <label>章节</label>
            <input type="text" id="editChapter" placeholder="例如: 第1章 引论">
          </div>
          <div class="edit-field">
            <label>题目</label>
            <input type="text" id="editQuestion" placeholder="题目内容">
          </div>
          <div class="edit-field">
            <label>答案</label>
            <textarea id="editAnswer" placeholder="答案内容"></textarea>
          </div>
          <div class="edit-field">
            <label>来源</label>
            <input type="text" id="editSource" placeholder="例如: 第1章.ppt.pdf 第10页">
          </div>
          <div class="edit-field">
            <label>个人备注</label>
            <textarea class="note-textarea" id="editNote" placeholder="添加你的学习笔记..."></textarea>
          </div>
          <div class="edit-actions">
            <button class="btn btn-success" id="editSaveBtn">💾 保存</button>
            <button class="btn btn-outline" id="editResetBtn">↩️ 恢复原文</button>
            <button class="btn btn-primary" id="editAddBtn">➕ 添加新题</button>
            <button class="btn btn-danger" id="editDeleteBtn" style="display:none">🗑️ 删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Import Modal -->
  <div class="modal-overlay import-modal" id="importModal">
    <div class="modal">
      <div class="modal-header"><h2>批量导入题目</h2><button class="modal-close" id="importModalClose">&times;</button></div>
      <div class="modal-body">
        <div class="import-header-info">
          <span>粘贴文本内容，支持两种格式自动识别</span>
          <button class="btn btn-outline" id="importRulesBtn">📋 查看格式规则</button>
        </div>
        <div class="import-rules" id="importRulesContent">''' + rules_escaped + '''</div>
        <textarea class="import-textarea" id="importTextarea" placeholder="在这里粘贴题目内容...

示例格式：
Q: 题目内容
A: 答案内容
---
Q: 题目2
A: 答案2"></textarea>
        <div class="import-actions">
          <button class="btn btn-primary" id="importPreviewBtn">🔍 预览解析</button>
        </div>
        <div class="import-preview" id="importPreview"></div>
        <button class="btn btn-success import-confirm-btn" id="importConfirmBtn" style="display:none">✅ 确认导入</button>
      </div>
    </div>
  </div>

  <!-- Manage Modal -->
  <div class="modal-overlay manage-modal" id="manageModal">
    <div class="modal">
      <div class="modal-header"><h2>管理题目</h2><button class="modal-close" id="manageModalClose">&times;</button></div>
      <div class="modal-body">
        <div class="manage-actions">
          <button class="btn btn-outline" id="manageSelectAll">全选</button>
          <button class="btn btn-outline" id="manageSelectNone">取消全选</button>
          <button class="btn btn-outline" id="manageSelectCustom">选中导入题</button>
          <button class="btn btn-danger" id="manageDeleteSelected">🗑️ 删除选中</button>
          <button class="btn btn-danger" id="manageDeleteAllCustom">🗑️ 删除全部导入题</button>
        </div>
        <div class="manage-list" id="manageList"></div>
      </div>
    </div>
  </div>

  <!-- Recycle Bin Modal -->
  <div class="modal-overlay manage-modal" id="recycleModal">
    <div class="modal">
      <div class="modal-header"><h2>♻️ 回收站</h2><button class="modal-close" id="recycleModalClose">&times;</button></div>
      <div class="modal-body">
        <div class="manage-actions">
          <button class="btn btn-outline" id="recycleRestoreAllBtn">恢复全部</button>
          <button class="btn btn-danger" id="recycleEmptyBtn">清空回收站</button>
        </div>
        <div class="manage-list" id="recycleList"></div>
      </div>
    </div>
  </div>

  <script>
    const QUESTIONS = ''' + json.dumps(data, ensure_ascii=False) + ''';
  </script>
  <script src="app.js"></script>
</body>
</html>'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Created index.html')
