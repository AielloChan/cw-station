// Reproducible import of short paragraphs from long-public-domain English originals.
import { writeFile } from 'node:fs/promises';
const books = [
 [1342,'Pride and Prejudice','Jane Austen','经典小说',1813,1817],
 [11,"Alice's Adventures in Wonderland",'Lewis Carroll','童话奇想',1865,1898],
 [1400,'Great Expectations','Charles Dickens','经典小说',1861,1870],
 [205,'Walden','Henry David Thoreau','自然随笔',1854,1862],
 [514,'Little Women','Louisa May Alcott','成长故事',1868,1888],
 [120,'Treasure Island','Robert Louis Stevenson','冒险故事',1883,1894],
 [902,'The Happy Prince and Other Tales','Oscar Wilde','童话奇想',1888,1900],
 [113,'The Secret Garden','Frances Hodgson Burnett','成长故事',1911,1924],
 [215,'The Call of the Wild','Jack London','冒险故事',1903,1916],
 [27805,'The Wind in the Willows','Kenneth Grahame','自然随笔',1908,1932]
];
const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").replace(/[—–]/g,' - ').replace(/[“”"_\[\]()]/g,'').replace(/;/g,',').replace(/!/g,'.').toUpperCase().replace(/[^A-Z0-9 .,?'\/:+@=\-]/g,' ').replace(/\s+/g,' ').trim();
const readings=[];
for (const [id,work,author,category,year,died] of books) {
 const response=await fetch(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`);
 if(!response.ok) throw new Error(`${id}: ${response.status}`);
 const raw=await response.text();
 const body=raw.split(/\*\*\* START OF[^\n]*\n/i)[1]?.split(/\*\*\* END OF/i)[0];
 if(!body) throw new Error(`Missing body: ${id}`);
 const candidates=body.split(/\r?\n\s*\r?\n/).map(p=>p.replace(/\s+/g,' ').trim()).filter(p=>{
   const words=p.split(' ').length;
   return words>=28 && words<=52 && /^[A-Z“"'‘]/.test(p) && /[.!?][”"'’]?$/.test(p) && !/gutenberg|copyright|illustration|contents|preface|edition|transcri|chapter|volume|dedicated|persons attempting/i.test(p) && !/[\d“”"]/.test(p) && !/\b(said|cried|replied|answered)\b/i.test(p);
 });
 if(candidates.length<10) throw new Error(`Too few paragraphs: ${id}`);
 // Keep each passage whole, favor the first half rather than ending spoilers.
 const pool=candidates.slice(0,Math.max(10,Math.floor(candidates.length*0.45)));
 for(let i=0;i<10;i++) {
  const paragraph=pool[Math.floor(i*pool.length/10)];
  readings.push({id:`reading-${id}-${i+1}`,title:`${work} · ${String(i+1).padStart(2,'0')}`,level:category,author,work,year,source:`https://www.gutenberg.org/ebooks/${id}`,text:normalize(paragraph)});
 }
 console.log(`${work}: ${candidates.length} eligible paragraphs → 10 excerpts (author died ${died})`);
}
if(new Set(readings.map(r=>r.text)).size!==readings.length) throw new Error('Duplicate excerpts');
await writeFile('src/readings.js', `// English originals published 1813–1911; authors died 1817–1932.\n// Source and author retained per excerpt. Case/punctuation normalized for the Morse alphabet.\nexport const READINGS = ${JSON.stringify(readings,null,2)};\n`);
