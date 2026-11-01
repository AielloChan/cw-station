const make = (id, title, level, rows) => ({ id, title, level, rows, text: rows.join(' ') });
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const groups = ['ABCD','EFGH','IJKL','MNOP','QRST','UVWX','YZ'];
export const BASICS = [
  ...groups.map((letters, index) => make(`basic-group-${index}`, `${letters[0]}–${letters.at(-1)} · 逐行练习`, '字母入门', [...letters].map(letter => letter.repeat(8)))),
  make('basic-digits-0', '0–4 · 逐行练习', '数字入门', [...'01234'].map(letter => letter.repeat(8))),
  make('basic-digits-1', '5–9 · 逐行练习', '数字入门', [...'56789'].map(letter => letter.repeat(8))),
  ...[...alphabet, ...digits].map(letter => make(`basic-single-${letter}`, `${letter} · 单字巩固`, /\d/.test(letter) ? '数字巩固' : '字母巩固', [letter.repeat(8), letter.repeat(8)])),
  ...[
    ['E / T · 点与划', ['EEEETTTT','ETETETET','TETETETE']],
    ['I / M · 两个点划', ['IIIIMMMM','IMIMIMIM','MMIIMIMI']],
    ['S / O · 三个点划', ['SSSSOOOO','SOSOSOSO','SOSOSSOS']],
    ['A / N · 先后顺序', ['AAAANNNN','ANANANAN','NNAANNAA']],
    ['A / B · 交替练习', ['AAAABBBB','ABABABAB','AABBAABB']],
    ['C / D · 听清节奏', ['CCCCDDDD','CDCDCDCD','DDCCDDCC']],
    ['A–D · 混合复习', ['ABCDABCD','DCBADCBA','ACBDBDAC']],
    ['数字 · 混合复习', ['01234567','89012345','98765432']]
  ].map(([title, rows], index) => make(`basic-mix-${index}`, title, '混合复习', rows))
];
