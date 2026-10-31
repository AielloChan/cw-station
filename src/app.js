import { MORSE, pretty, MorseKeyer } from './morse.js';
import { LESSONS } from './content.js';
import { Sidetone } from './audio.js';

const $ = id => document.getElementById(id);
let saved = {};
try { saved = JSON.parse(localStorage.getItem('cw-station-settings') || '{}') || {}; } catch { /* Storage is optional. */ }
const clamp = (value, min, max, fallback) => Number.isFinite(+value) ? Math.max(min, Math.min(max, +value)) : fallback;
const settings = { sound: saved.sound !== false, threshold: clamp(saved.threshold, 100, 300, 180), gap: clamp(saved.gap, 300, 1200, 600), hint: saved.hint !== false };
let mode = 'english', lessonIndex = 0, position = 0, attempts = 0, correct = 0, freeText = '', activeInput = null;
let audition = false, auditionToken = 0, safetyTimer, pressTimer, installPrompt;
const feedback = text => { $('feedback').textContent = text; };
const tone = new Sidetone(feedback);
const lesson = () => LESSONS[mode]?.[lessonIndex];
const target = () => lesson()?.text[position];
const save = () => { try { localStorage.setItem('cw-station-settings', JSON.stringify(settings)); } catch { /* Private mode may disallow storage. */ } };
const keyer = new MorseKeyer({ threshold: settings.threshold, gap: settings.gap,
  onSequence(code) {
    $('live-code').textContent = code ? pretty(code).split('').join(' ') : '等待敲击';
    $('live-code').classList.toggle('has-signal', !!code);
  },
  onLetter(letter, code) {
    $('gap-fill').classList.remove('counting');
    $('decoded').textContent = letter ?? '?';
    if (mode === 'free') {
      freeText += letter ?? '□';
      feedback(letter ? `已收到 ${letter} · ${pretty(code)}` : `未识别 ${pretty(code)}，可删除后重试。`);
    } else if (target()) {
      attempts++;
      if (letter === target()) {
        correct++; position++;
        while (lesson().text[position] === ' ') position++;
        feedback(position === lesson().text.length ? '这卷纸带完成了。漂亮！可以换一篇继续练习。' : `收到 ${letter}，继续保持这个节奏。`);
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
  $('target-label').textContent = mode === 'free' ? '自由发报' : char ? '下一个字符' : '练习完成';
  $('target-letter').textContent = mode === 'free' ? 'CW' : char ?? '73';
  $('target-code').textContent = mode === 'free' ? '随心敲击' : char ? (settings.hint ? pretty(MORSE[char]).split('').join(' ') : '提示已隐藏') : '做得漂亮';
  $('listen').disabled = !char || !settings.sound;
}

function setPressed(pressed) {
  $('telegraph-key').classList.toggle('pressed', pressed); $('telegraph-key').setAttribute('aria-pressed', String(pressed));
  $('signal-led').classList.toggle('lit', pressed); $('signal-state').textContent = pressed ? '正在发报' : '准备发报';
}
function cancelInput() {
  activeInput = null; clearTimeout(safetyTimer); clearTimeout(pressTimer); keyer.reset(); tone.stop();
  audition = false; auditionToken++; setPressed(false); $('gap-fill').classList.remove('counting');
}
function press(source) {
  if (activeInput !== null || audition || $('lesson-dialog').open || $('install-dialog').open) return;
  if (mode !== 'free' && !target()) { feedback('本篇已完成，点击「换一篇」开始新的练习。'); return; }
  activeInput = source; keyer.press(); setPressed(true); tone.start(); $('decoded').textContent = '';
  $('gap-fill').classList.remove('counting');
  pressTimer = setTimeout(() => { $('signal-state').textContent = '长音 −'; }, settings.threshold);
  safetyTimer = setTimeout(() => { cancelInput(); feedback('已松开发报电键，避免持续长鸣。再按即可继续。'); }, 10000);
}
function release(source) {
  if (activeInput !== source) return;
  activeInput = null; clearTimeout(safetyTimer); clearTimeout(pressTimer); tone.stop(); setPressed(false); keyer.release();
  if (keyer.sequence) {
    const fill = $('gap-fill'); fill.style.setProperty('--gap', `${settings.gap}ms`); void fill.offsetWidth; fill.classList.add('counting');
  }
}
const key = $('telegraph-key');
key.addEventListener('pointerdown', event => { if (!event.isPrimary || event.button !== 0) return; event.preventDefault(); key.focus({ preventScroll: true }); key.setPointerCapture(event.pointerId); press(event.pointerId); });
key.addEventListener('pointerup', event => release(event.pointerId));
key.addEventListener('pointercancel', event => { if (activeInput === event.pointerId) cancelInput(); });
key.addEventListener('lostpointercapture', event => { if (activeInput === event.pointerId) cancelInput(); });
key.addEventListener('contextmenu', event => event.preventDefault());
const isEditing = element => element.closest('input, textarea, select, [contenteditable="true"], dialog') || (element.closest('button, a') && element !== key);
window.addEventListener('keydown', event => {
  if (event.code !== 'Space' || isEditing(event.target)) return;
  event.preventDefault(); if (!event.repeat) press('keyboard');
});
window.addEventListener('keyup', event => { if (event.code === 'Space' && activeInput === 'keyboard') { event.preventDefault(); release('keyboard'); } });
window.addEventListener('blur', cancelInput);
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelInput(); });

function resetLesson() {
  cancelInput(); position = attempts = correct = 0; freeText = ''; $('decoded').textContent = '';
  $('lesson-title').textContent = mode === 'free' ? 'Your words, your rhythm.' : lesson().title;
  $('lesson-level').textContent = mode === 'free' ? '自由纸带' : lesson().level;
  $('choose-lesson').hidden = mode === 'free'; $('free-actions').hidden = mode !== 'free';
  feedback(mode === 'free' ? '随心发报；长停顿自动插入空格，更多设置里可以删字。' : '短按为点，长按为划；停顿后自动识别。');
  renderPaper(); renderTarget();
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  if (mode === button.dataset.mode) return;
  mode = button.dataset.mode; lessonIndex = 0;
  document.querySelectorAll('[data-mode]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  resetLesson();
}));
$('restart').addEventListener('click', resetLesson);
$('choose-lesson').addEventListener('click', () => {
  cancelInput(); const options = $('lesson-options'); options.replaceChildren();
  LESSONS[mode].forEach((item, index) => {
    const button = document.createElement('button'); button.className = 'lesson-option';
    const title = document.createElement('strong'); title.textContent = item.title;
    const description = document.createElement('span'); description.textContent = `${item.level} · ${item.text.replaceAll(' ', '').length} 字符`;
    const preview = document.createElement('p'); preview.textContent = item.text;
    button.append(title, description, preview);
    button.addEventListener('click', () => { lessonIndex = index; $('lesson-dialog').close(); resetLesson(); }); options.append(button);
  }); $('lesson-dialog').showModal();
});
$('close-lessons').addEventListener('click', () => $('lesson-dialog').close());
$('close-install').addEventListener('click', () => $('install-dialog').close());
for (const [button, panel] of [['settings-button', 'advanced-settings'], ['reference-button', 'reference']]) {
  $(button).addEventListener('click', () => { $(panel).hidden = !$(panel).hidden; $(button).setAttribute('aria-expanded', String(!$(panel).hidden)); });
}
function renderSettings() {
  $('sound').setAttribute('aria-checked', String(settings.sound)); $('sound-label').textContent = settings.sound ? '已开启' : '已关闭'; tone.setEnabled(settings.sound);
  $('sensitivity').value = settings.threshold; $('sensitivity-value').textContent = `${settings.threshold < 160 ? '轻快' : settings.threshold > 220 ? '从容' : '标准'} · ${settings.threshold} ms`;
  $('letter-gap').value = settings.gap; $('gap-value').textContent = `${settings.gap} ms`; $('show-hint').checked = settings.hint; renderTarget();
}
$('sound').addEventListener('click', () => { cancelInput(); settings.sound = !settings.sound; renderSettings(); save(); });
$('sensitivity').addEventListener('input', event => { cancelInput(); settings.threshold = +event.target.value; keyer.configure(settings.threshold, settings.gap); renderSettings(); save(); });
$('letter-gap').addEventListener('input', event => { cancelInput(); settings.gap = +event.target.value; keyer.configure(settings.threshold, settings.gap); renderSettings(); save(); });
$('show-hint').addEventListener('change', event => { settings.hint = event.target.checked; renderTarget(); save(); });
$('insert-space').addEventListener('click', () => { cancelInput(); if (freeText && !freeText.endsWith(' ')) freeText += ' '; renderPaper(); });
$('delete-letter').addEventListener('click', () => { cancelInput(); freeText = freeText.slice(0, -1); renderPaper(); });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
$('listen').addEventListener('click', async () => {
  cancelInput(); const code = MORSE[target()]; if (!code || !settings.sound) return;
  audition = true; const token = ++auditionToken; const unit = settings.threshold / 2;
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
window.addEventListener('appinstalled', () => { $('install').hidden = true; });
if (matchMedia('(display-mode: standalone)').matches) $('install').hidden = true;
let offlineReady = false;
function connection() { $('offline-state').textContent = !navigator.onLine ? (offlineReady ? '离线练习中' : '当前无网络') : offlineReady ? '离线已就绪' : '本地练习'; }
window.addEventListener('online', connection); window.addEventListener('offline', connection);
if ('serviceWorker' in navigator && location.port !== '5173') {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => { offlineReady = true; connection(); }).catch(() => { $('offline-state').textContent = '离线准备失败'; });
}
renderSettings(); resetLesson(); connection();
