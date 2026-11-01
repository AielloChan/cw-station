import { MORSE, pretty, MorseKeyer } from './morse.js';
import { LESSONS } from './content.js';
import { Sidetone } from './audio.js';
import { SendingSpeed } from './speed.js';
import { PaperTransport } from './paper.js';
import { filterLessons, randomLessonIndex, characterCount } from './library.js';
import { setupConsole } from './console.js';
import { timingForTempo, loadTiming } from './timing.js';

const $ = id => document.getElementById(id);
let saved = {};
try { saved = JSON.parse(localStorage.getItem('cw-station-settings') || '{}') || {}; } catch { /* Storage is optional. */ }
const settings = { sound: saved.sound !== false, ...loadTiming(saved), hint: saved.hint !== false };
let mode = 'english', lessonIndex = 0, position = 0, attempts = 0, correct = 0, freeText = '', activeInput = null;
let audition = false, auditionToken = 0, safetyTimer, pressTimer, installPrompt;
let lastReceived = null;
const feedback = text => { $('feedback').textContent = text; };
const tone = new Sidetone(feedback);
const speed = new SendingSpeed();
const transport = new PaperTransport(document.querySelector('.paper-assembly'), document.querySelector('.paper'), () => {
  feedback(mode === 'free' ? '新纸已就位，随心发报。' : '新纸已就位，短按为点，长按为划。');
});
let requested = { mode, index: lessonIndex };
const lesson = () => LESSONS[mode]?.[lessonIndex];
const target = () => lesson()?.text[position];
const save = () => { try { localStorage.setItem('cw-station-settings', JSON.stringify(settings)); } catch { /* Private mode may disallow storage. */ } };
const keyer = new MorseKeyer({ threshold: settings.threshold, gap: settings.gap,
  onSequence() { renderReceiver(); },
  onLetter(letter, code) {
    $('gap-fill').classList.remove('counting');
    lastReceived = { letter, code, matched: mode === 'free' ? null : letter === target() };
    speed.record(letter, lastReceived.matched); renderSpeed();
    if (mode === 'free') {
      freeText += letter ?? '□';
      feedback(letter ? `已收到 ${letter} · ${pretty(code)}` : `未识别 ${pretty(code)}，可删除后重试。`);
    } else if (target()) {
      attempts++;
      if (letter === target()) {
        correct++; position++;
        while (lesson().text[position] === ' ') position++;
        feedback(position === lesson().text.length ? '这卷纸带完成了。漂亮！可以换一篇继续练习。' : `${letter} 已完成，请输入 ${target()}。`);
      } else {
        feedback(`收到 ${letter ?? '未知编码'}（${pretty(code)}），目标是 ${target()}，再试一次。`);
        $('paper-text').classList.remove('mistake'); void $('paper-text').offsetWidth; $('paper-text').classList.add('mistake');
      }
    }
    renderPaper(); renderTarget();
  },
  onWord() { if (mode === 'free' && freeText && !freeText.endsWith(' ')) { freeText += ' '; renderPaper(); } }
});

function renderPaper() {
  const paper = $('paper-text'); paper.replaceChildren();
  if (mode === 'free') {
    const output = document.createElement('span'); output.className = 'free-output'; output.textContent = freeText;
    paper.append(output);
    if (!freeText) { const placeholder = document.createElement('span'); placeholder.className = 'free-placeholder'; placeholder.textContent = '电波由你书写。\n敲下第一个点，开始自由发报。'; paper.append(placeholder); }
    const cursor = document.createElement('span'); cursor.className = 'free-cursor'; cursor.textContent = '▏'; paper.append(cursor);
    $('paper-progress').textContent = `已打印 ${freeText.replaceAll(' ', '').length} 字符`;
    $('accuracy').textContent = '长停顿自动分词'; $('progress-fill').style.width = '0%';
    paper.scrollTop = paper.scrollHeight;
  } else {
    let offset = 0;
    for (const word of lesson().text.split(' ')) {
      const group = document.createElement('span'); group.className = 'word';
      for (const char of word) {
        const span = document.createElement('span'); span.textContent = char;
        span.className = offset < position ? 'done' : offset === position ? 'current' : 'pending';
        if (offset === position) span.setAttribute('aria-current', 'true');
        group.append(span); offset++;
      }
      paper.append(group, document.createTextNode(' ')); offset++;
    }
    const total = lesson().text.replaceAll(' ', '').length;
    const done = lesson().text.slice(0, position).replaceAll(' ', '').length;
    $('paper-progress').textContent = `已完成 ${done} / ${total} 字符`;
    $('accuracy').textContent = attempts ? `准确率 ${Math.round(correct / attempts * 100)}%` : '准确率 —';
    $('progress-fill').style.width = `${done / total * 100}%`;
    const current = paper.querySelector('.current');
    if (current) paper.scrollTop = Math.max(0, current.offsetTop - paper.offsetTop - 45);
  }
}

function renderTarget() {
  const char = target();
  $('target-label').textContent = mode === 'free' ? '自由发报' : char ? '待输入字符' : '练习完成';
  $('target-letter').textContent = mode === 'free' ? 'CW' : char ?? '73';
  $('target-code').textContent = mode === 'free' ? '随心敲击' : char ? (settings.hint ? pretty(MORSE[char]).split('').join(' ') : '提示已隐藏') : '做得漂亮';
  $('listen').disabled = !char || !settings.sound;
}

function renderReceiver() {
  const typing = keyer.started !== null || !!keyer.sequence;
  const code = typing ? keyer.sequence : lastReceived?.code;
  $('receiver-label').textContent = typing
    ? (keyer.started !== null ? '正在输入' : `等待识别 · ${settings.gap}ms`)
    : lastReceived
      ? (lastReceived.matched === true ? '上一字 · 正确' : lastReceived.matched === false ? '上一字 · 未匹配' : '上一字 · 已识别')
      : '输入状态';
  $('live-code').textContent = code ? pretty(code).split('').join(' ') : typing ? '按下中' : '按下开始';
  $('live-code').classList.toggle('has-signal', !!code);
  $('decoded').textContent = !typing && lastReceived ? lastReceived.letter ?? '?' : '';
}

function setPressed(pressed) {
  $('telegraph-key').classList.toggle('pressed', pressed); $('telegraph-key').setAttribute('aria-pressed', String(pressed));
  $('signal-led').classList.toggle('lit', pressed); $('signal-state').textContent = pressed ? '正在发报' : '准备发报';
}
function cancelInput() {
  const interrupted = activeInput !== null || !!keyer.sequence;
  activeInput = null; clearTimeout(safetyTimer); clearTimeout(pressTimer); keyer.reset(); tone.stop();
  audition = false; auditionToken++; setPressed(false); $('gap-fill').classList.remove('counting');
  if (interrupted) feedback(mode === 'free' ? '未完成的输入已取消，可以重新敲击。' : `未完成的输入已取消，请重新输入 ${target()}。`);
}
function press(source) {
  if (transport.busy || activeInput !== null || audition || document.querySelector('dialog[open]')) return;
  if (mode !== 'free' && !target()) { feedback('本篇已完成，点击「换一篇」开始新的练习。'); return; }
  activeInput = source; speed.start(); keyer.press();
  if (mode !== 'free' && !target()) { activeInput = null; keyer.reset(); return; }
  setPressed(true); tone.start(); renderReceiver();
  feedback(mode === 'free' ? '正在输入；松开并停顿后自动识别。' : `正在输入 ${target()}；松开并停顿后自动识别。`);
  $('gap-fill').classList.remove('counting');
  pressTimer = setTimeout(() => { $('signal-state').textContent = '长音 −'; }, settings.threshold);
  safetyTimer = setTimeout(() => { cancelInput(); feedback('已松开发报电键，避免持续长鸣。再按即可继续。'); }, 10000);
}
function release(source) {
  if (activeInput !== source) return;
  activeInput = null; clearTimeout(safetyTimer); clearTimeout(pressTimer); tone.stop(); setPressed(false); keyer.release();
  renderReceiver();
  if (keyer.sequence) {
    const fill = $('gap-fill'); fill.style.setProperty('--gap', `${settings.gap}ms`); void fill.offsetWidth; fill.classList.add('counting');
  }
}
const key = $('telegraph-key');
// Safari can retain :focus-visible after focus() inside a prevented touch event.
// Keep focus for keyboard control, but show the ring only after keyboard input.
document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, { capture: true });
document.addEventListener('keydown', event => {
  if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.isComposing) document.documentElement.dataset.input = 'keyboard';
}, { capture: true });
key.addEventListener('pointerdown', event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); key.focus({ preventScroll: true }); key.setPointerCapture(event.pointerId); press(event.pointerId); });
key.addEventListener('pointerup', event => release(event.pointerId));
key.addEventListener('pointercancel', event => { if (activeInput === event.pointerId) cancelInput(); });
key.addEventListener('lostpointercapture', event => { if (activeInput === event.pointerId) cancelInput(); });
// All surfaces behave like an instrument, including dialogs and future controls.
for (const type of ['selectstart', 'contextmenu']) {
  document.addEventListener(type, event => event.preventDefault(), { capture: true });
}
document.addEventListener('dblclick', event => {
  event.preventDefault();
  window.getSelection()?.removeAllRanges();
}, { capture: true });
const isEditing = element => element.closest('input, textarea, select, summary, [contenteditable="true"], dialog') || (element.closest('button, a') && element !== key);
const keyingCodes = new Set(['Space', 'Enter', 'NumpadEnter']);
window.addEventListener('keydown', event => {
  if (!keyingCodes.has(event.code) || event.altKey || event.ctrlKey || event.metaKey || event.isComposing || isEditing(event.target)) return;
  event.preventDefault(); if (!event.repeat) press(`keyboard:${event.code}`);
});
window.addEventListener('keyup', event => {
  const source = `keyboard:${event.code}`;
  if (keyingCodes.has(event.code) && activeInput === source) { event.preventDefault(); release(source); }
});
window.addEventListener('blur', cancelInput);
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (transport.busy) transport.finish(); cancelInput(); } });

function resetLesson() {
  cancelInput(); position = attempts = correct = 0; freeText = ''; lastReceived = null;
  speed.reset(); renderSpeed();
  $('lesson-title').textContent = mode === 'free' ? 'Your words, your rhythm.' : lesson().title;
  $('lesson-title').title = $('lesson-title').textContent;
  $('lesson-level').textContent = mode === 'free' ? '自由纸带' : lesson().level;
  $('lesson-actions').hidden = mode === 'free'; $('free-actions').hidden = mode !== 'free';
  const credit = $('lesson-credit'); credit.replaceChildren(); credit.hidden = !lesson()?.author || mode === 'free';
  if (!credit.hidden) {
    const source = document.createElement('a'); source.href = lesson().source; source.target = '_blank'; source.rel = 'noopener noreferrer';
    source.textContent = '原作 ↗'; credit.append(`${lesson().author} · ${lesson().year} · `, source);
  }
  $('settings-source').replaceChildren(...Array.from(credit.childNodes, node => node.cloneNode(true)));
  $('settings-source').hidden = credit.hidden;
  feedback(mode === 'free' ? '随心发报；长停顿自动插入空格，更多设置里可以删字。' : '短按为点，长按为划；停顿后自动识别。');
  renderPaper(); renderTarget(); renderReceiver();
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  if (requested.mode === button.dataset.mode) return;
  changeLesson(button.dataset.mode, 0);
}));
function changeLesson(nextMode, index) {
  requested = { mode: nextMode, index }; cancelInput();
  feedback('正在换纸…');
  transport.replace(() => {
    mode = nextMode; lessonIndex = index;
    document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.mode === mode)));
    resetLesson(); $('paper-text').scrollTop = 0; feedback('正在送纸，稍候即可发报。');
  });
}
$('restart').addEventListener('click', () => { if (transport.busy) transport.finish(); resetLesson(); });
let visibleLessons = 20;
const filteredLessons = () => filterLessons(LESSONS[mode] || [], { query: $('lesson-search').value, category: $('lesson-category').value, length: $('lesson-length').value });
function renderLessonList() {
  const matches = filteredLessons(), options = $('lesson-options'); options.replaceChildren();
  $('lesson-count').textContent = `${matches.length} / ${LESSONS[mode].length} 篇`;
  $('random-filtered').disabled = !matches.length;
  if (!matches.length) { const empty = document.createElement('p'); empty.textContent = '没有匹配的内容，试试别的关键词或放宽筛选。'; options.append(empty); }
  for (const { lesson: item, index } of matches.slice(0, visibleLessons)) {
    const button = document.createElement('button'); button.className = 'lesson-option';
    if (index === lessonIndex) button.setAttribute('aria-current', 'true');
    const title = document.createElement('strong'); title.textContent = item.title;
    const description = document.createElement('span'); description.textContent = `${item.author || '小站原创'} · ${item.level} · ${characterCount(item)} 字符${index === lessonIndex ? ' · 当前' : ''}`;
    const preview = document.createElement('p'); preview.textContent = item.text;
    button.append(title, description, preview);
    button.addEventListener('click', () => { $('lesson-dialog').close(); if (index !== lessonIndex) changeLesson(mode, index); }); options.append(button);
  }
  $('more-lessons').hidden = matches.length <= visibleLessons;
}
function chooseRandom(indices, nextMode = mode) {
  const index = randomLessonIndex(indices, requested.mode === nextMode ? requested.index : -1);
  if (index !== null) changeLesson(nextMode, index);
}
$('random-lesson').addEventListener('click', () => {
  const nextMode = requested.mode === 'free' ? mode : requested.mode;
  chooseRandom(LESSONS[nextMode].map((_, index) => index), nextMode);
});
$('random-filtered').addEventListener('click', () => { const indices = filteredLessons().map(item => item.index); $('lesson-dialog').close(); chooseRandom(indices); });
for (const id of ['lesson-search', 'lesson-category', 'lesson-length']) {
  $(id).addEventListener(id === 'lesson-search' ? 'input' : 'change', () => { visibleLessons = 20; renderLessonList(); });
}
$('more-lessons').addEventListener('click', () => { visibleLessons += 20; renderLessonList(); });
$('choose-lesson').addEventListener('click', () => {
  if (transport.busy) transport.finish(); cancelInput();
  if (mode === 'free') return;
  $('lesson-search').value = ''; $('lesson-length').value = ''; $('lesson-category').replaceChildren(new Option('全部类别', ''));
  for (const category of new Set(LESSONS[mode].map(item => item.level))) $('lesson-category').append(new Option(category, category));
  visibleLessons = 20; renderLessonList(); $('lesson-dialog').showModal(); $('lesson-options').scrollTop = 0;
});
$('close-lessons').addEventListener('click', () => $('lesson-dialog').close());
$('close-install').addEventListener('click', () => $('install-dialog').close());
$('speed-button').addEventListener('click', () => { cancelInput(); renderSpeed(); $('speed-dialog').showModal(); });
$('close-speed').addEventListener('click', () => $('speed-dialog').close());
function renderSpeed() {
  const stats = speed.snapshot();
  $('speed-value').textContent = stats.wpm.toFixed(1);
  $('speed-sampling').textContent = !stats.started ? '敲击后开始计速' : stats.sampledSeconds < 30 ? `采样中 ${stats.sampledSeconds}/30 s` : '滚动统计 · 含停顿';
  $('speed-detail-wpm').textContent = stats.wpm.toFixed(1);
  $('speed-detail-cpm').textContent = stats.cpm;
  $('speed-detail-accuracy').textContent = mode === 'free' || stats.accuracy === null ? '—' : `${stats.accuracy}%`;
  $('speed-window-summary').textContent = `最近 30 秒：已识别 ${stats.recognized} 字符，未识别 ${stats.invalid} 次。${mode === 'free' ? '自由模式不核对目标正确率。' : `正确输出 ${stats.correctWpm.toFixed(1)} WPM。`}`;
  $('speed-comparison').textContent = stats.wpm > 0 ? `保持当前平均节奏，发出 100 个字符约需 ${Math.round(6000 / stats.cpm)} 秒。慢一点也没关系，先把每个字发清楚。` : '先敲出一个字符。速度会随着最近 30 秒的实际输出更新，停下来也会慢慢回落。';
}
setInterval(renderSpeed, 250);
for (const [button, panel, close] of [['settings-button', 'settings-dialog', 'close-settings'], ['reference-button', 'reference', 'close-reference']]) {
  $(button).addEventListener('click', () => { cancelInput(); $(panel).showModal(); });
  $(close).addEventListener('click', () => $(panel).close());
}
function renderSettings() {
  $('sound').setAttribute('aria-checked', String(settings.sound)); $('sound-label').textContent = settings.sound ? '已开启' : '已关闭'; tone.setEnabled(settings.sound);
  $('tempo').value = settings.tempo; $('sensitivity-value').textContent = settings.timingMode === 'manual' ? '手动' : `${settings.tempo} WPM`;
  $('sensitivity').value = settings.threshold; $('threshold-value').textContent = `${settings.threshold}ms`;
  $('letter-gap').value = settings.gap; $('gap-value').textContent = `${settings.gap}ms`;
  $('manual-timing').checked = settings.timingMode === 'manual'; $('manual-timing-controls').disabled = settings.timingMode !== 'manual';
  $('manual-timing-controls').hidden = settings.timingMode !== 'manual';
  const unit = settings.timingMode === 'manual' ? settings.threshold / 2 : timingForTempo(settings.tempo).unit;
  $('timing-preview').textContent = `${settings.timingMode === 'manual' ? '手动设置' : `参考节奏 ${settings.tempo} WPM`}：点约 ${Math.round(unit)}ms，划约 ${Math.round(unit * 3)}ms；按压少于 ${settings.threshold}ms 判为点。字间等待 ${settings.gap}ms，自由模式停顿约 ${Math.round(settings.gap * 7 / 3)}ms 自动分词。`;
  $('show-hint').checked = settings.hint; renderTarget();
}
function applyTiming() { cancelInput(); keyer.configure(settings.threshold, settings.gap); renderSettings(); save(); }
function setTempo(value) {
  const timing = timingForTempo(value);
  Object.assign(settings, { tempo: timing.tempo, threshold: timing.threshold, gap: timing.gap, timingMode: 'tempo' });
  applyTiming();
}
$('tempo').addEventListener('input', event => setTempo(event.target.value));
document.querySelectorAll('[data-tempo]').forEach(button => button.addEventListener('click', () => setTempo(button.dataset.tempo)));
$('manual-timing').addEventListener('change', event => {
  if (!event.target.checked) setTempo(settings.tempo);
  else { settings.timingMode = 'manual'; applyTiming(); }
});
$('sound').addEventListener('click', () => { cancelInput(); settings.sound = !settings.sound; renderSettings(); save(); });
$('sensitivity').addEventListener('input', event => { settings.timingMode = 'manual'; settings.threshold = +event.target.value; applyTiming(); });
$('letter-gap').addEventListener('input', event => { settings.timingMode = 'manual'; settings.gap = +event.target.value; applyTiming(); });
$('show-hint').addEventListener('change', event => { settings.hint = event.target.checked; renderTarget(); save(); });
$('insert-space').addEventListener('click', () => { cancelInput(); if (freeText && !freeText.endsWith(' ')) freeText += ' '; renderPaper(); });
$('delete-letter').addEventListener('click', () => { cancelInput(); freeText = freeText.slice(0, -1); renderPaper(); });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
$('listen').addEventListener('click', async () => {
  if (transport.busy) return;
  cancelInput(); const code = MORSE[target()]; if (!code || !settings.sound) return;
  audition = true; const token = ++auditionToken; const unit = settings.timingMode === 'manual' ? settings.threshold / 2 : timingForTempo(settings.tempo).unit;
  feedback(`听一听 ${target()}：${pretty(code)}`);
  for (const mark of code) {
    if (token !== auditionToken) return;
    setPressed(true); tone.start(); await sleep(mark === '.' ? unit : unit * 3);
    if (token !== auditionToken) return;
    tone.stop(); setPressed(false); await sleep(unit);
  }
  if (token === auditionToken) { audition = false; feedback('轮到你了，试着敲出同样的节奏。'); }
});
for (const [letter, code] of Object.entries(MORSE)) {
  const cell = document.createElement('div'); const name = document.createElement('strong'); name.textContent = letter;
  const symbols = document.createElement('span'); symbols.textContent = pretty(code); cell.append(name, symbols); $('reference-grid').append(cell);
}
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
$('install').addEventListener('click', async () => {
  cancelInput();
  if (installPrompt) { await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; }
  else $('install-dialog').showModal();
});
window.addEventListener('appinstalled', () => { $('install').hidden = true; $('install-from-settings').hidden = true; });
$('install-from-settings').addEventListener('click', () => { $('settings-dialog').close(); $('install').click(); });
if (matchMedia('(display-mode: standalone)').matches) { $('install').hidden = true; $('install-from-settings').hidden = true; }
let offlineReady = false;
function connection() { $('offline-state').textContent = !navigator.onLine ? (offlineReady ? '离线练习中' : '当前无网络') : offlineReady ? '离线已就绪' : '本地练习'; $('settings-connection').textContent = $('offline-state').textContent; }
window.addEventListener('online', connection); window.addEventListener('offline', connection);
if ('serviceWorker' in navigator && location.port !== '5173') {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => { offlineReady = true; connection(); }).catch(() => { $('offline-state').textContent = '离线准备失败'; });
}
renderSettings(); resetLesson(); connection(); setupConsole(cancelInput);
