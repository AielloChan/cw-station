import { READINGS } from './readings.js';
export const LESSONS = {
  english: [
    { title: 'A little every day', level: '入门短文', text: 'A LITTLE PRACTICE EVERY DAY GOES A LONG WAY. TAKE YOUR TIME AND FIND YOUR RHYTHM.' },
    { title: 'Across the ocean', level: '英文短文', text: 'THE NIGHT IS QUIET. A SMALL SIGNAL CROSSES THE OCEAN. SOMEWHERE A FRIEND IS LISTENING.' },
    { title: 'The quick brown fox', level: '全字母练习', text: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS.' },
    ...READINGS
  ],
  qso: [
    { title: '第一次呼叫', level: '模拟通联 · CQ', text: 'CQ CQ CQ DE BV0AAA BV0AAA K' },
    { title: '交换信号报告', level: '模拟通联 · RST', text: 'BV0AAA DE JA0ZZZ GM UR RST 599 599 NAME TOM QTH TOKYO HW? K' },
    { title: '结束一次通联', level: '模拟通联 · 73', text: 'R TNX FER QSO HPE CU AGN 73 DE BV0AAA K' },
    { title: '确认呼号', level: '模拟通联 · 呼号', text: 'AGN PSE UR CALL? DE BV0AAA K' },
    { title: '慢一点，请再发一次', level: '模拟通联 · QRS', text: 'PSE QRS QRS NEW TO CW HR TNX DE BV0AAA K' },
    { title: '海边便携台', level: '模拟通联 · 户外', text: 'CQ CQ DE BV0AAA/P K R R UR RST 579 QTH BEACH PWR 5W ANT VERTICAL HW? K' },
    { title: '山顶来电', level: '模拟通联 · 户外', text: 'CQ SOTA DE JA0ZZZ/P K GM UR RST 559 QTH SUMMIT TNX FER CALL 73 K' },
    { title: '低功率的问候', level: '模拟通联 · QRP', text: 'UR RST 539 539 RIG QRP PWR 3W ANT DIPOLE HW COPY? K' },
    { title: '更正信号报告', level: '模拟通联 · RST', text: 'SRI CORRECTION UR RST 579 579 QSB HR PSE AGN NAME K' },
    { title: '天气与设备', level: '模拟通联 · 闲聊', text: 'WX SUNNY TEMP 22C RIG HOME MADE PWR 10W ANT LOOP HW? K' },
    { title: '夜间传播', level: '模拟通联 · 闲聊', text: 'GE NICE SIG TONITE BAND QUIET UR RST 589 QTH OSAKA K' },
    { title: '需要重复姓名', level: '模拟通联 · 重复', text: 'R R RST 559 NAME AGN PSE NAME AGN DE BV0AAA K' },
    { title: '短暂停等', level: '模拟通联 · 等待', text: 'PSE QRX 1 MIN QRX 1 MIN TNX K' },
    { title: '频率是否空闲', level: '模拟通联 · QRL', text: 'QRL? QRL? DE BV0AAA K' },
    { title: '第一次 CW 通联', level: '模拟通联 · 入门', text: 'TNX THIS IS MY FIRST CW QSO PSE QRS UR RST 599 NAME LEE K' },
    { title: '相约明天', level: '模拟通联 · 约定', text: 'R HPE CU TMW SAME FREQ AT 1200 UTC TNX FER NICE QSO 73 K' },
    { title: '远方的朋友', level: '模拟通联 · DX', text: 'GM FB SIG FM UR SIDE UR RST 569 QTH LONDON NAME SAM K' },
    { title: '比赛简短交换', level: '模拟通联 · 竞赛', text: 'CQ TEST DE BV0AAA K JA0ZZZ 599 001 K R 599 025 TU BV0AAA TEST' },
    { title: '信号逐渐衰落', level: '模拟通联 · QSB', text: 'SRI QSB QSB UR SIG FADING PSE RPT RST AND QTH K' },
    { title: '收到你的明信片', level: '模拟通联 · QSL', text: 'R QSL VIA BURO TNX FER CARD VY NICE PHOTO HPE CU AGN 73 K' },
    { title: '收台之前', level: '模拟通联 · CL', text: 'TNX FER FB QSO MUST QRT NOW BEST WISHES 73 DE BV0AAA CL' }
  ]
};
