// 글 페이지 유사도 — node test-similar.js
//   ① 사이트 안: 글끼리 문단을 돌려 쓰지 않았는지
//   ② 러닝트래블(같은 운영사 과정을 안내하는 첫 사이트)과 문장이 겹치지 않는지
// 재는 법: 낱말 3개 묶음(3-gram) 자카드. 0.25 를 넘으면 목록에 찍는다. 같은 사실(학교 이름·일정)은 어느 정도 겹칠 수밖에 없다.
const fs = require("fs");
const path = require("path");
const ARTICLES = require("./content");
const EDU = path.join(__dirname, "..", "..", "러닝트래블(edujourney)", "site", "docs");
const LIMIT = Number(process.argv[2] || 0.25);

const strip = (s) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
const strs = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strs) : v && typeof v === "object" ? Object.values(v).flatMap(strs) : []);
const grams = (t) => {
  const w = t.replace(/\{\{[^}]+\}\}/g, " ").replace(/[^가-힣a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const g = new Set();
  for (let i = 0; i + 2 < w.length; i++) g.add(w[i] + " " + w[i + 1] + " " + w[i + 2]);
  return g;
};
const jac = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1); };
// 한쪽이 훨씬 길 때 자카드는 작게 나온다 — 짧은 글 기준으로 얼마나 들어 있는지도 본다
const contain = (a, b) => { let n = 0; const [s, l] = a.size < b.size ? [a, b] : [b, a]; for (const x of s) if (l.has(x)) n++; return n / (s.size || 1); };

const mine = ARTICLES.map((a) => ({ id: a.slug, g: grams(strip(strs([a.lead, a.sections, a.faq]).join(" "))) }));

const inside = [];
for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) {
  const s = jac(mine[i].g, mine[j].g);
  if (s >= LIMIT) inside.push([s, mine[i].id, mine[j].id]);
}
inside.sort((a, b) => b[0] - a[0]);
console.log(`① 사이트 안 — 글 ${mine.length}편, ${LIMIT} 이상 ${inside.length}쌍`);
inside.slice(0, 30).forEach(([s, a, b]) => console.log(`  ${s.toFixed(2)}  ${a}  ↔  ${b}`));

let cross = [];
if (fs.existsSync(EDU)) {
  const edu = fs.readdirSync(EDU).filter((f) => f.endsWith(".html")).map((f) => {
    const h = fs.readFileSync(path.join(EDU, f), "utf8");
    const main = (h.match(/<main[\s\S]*?<\/main>/) || [h])[0].replace(/<div class="consult-ov"[\s\S]*$/, "");
    return { id: f, g: grams(strip(main)) };
  });
  for (const m of mine) {
    let best = [0, ""];
    for (const e of edu) { const s = contain(m.g, e.g); if (s > best[0]) best = [s, e.id]; }
    cross.push([best[0], m.id, best[1]]);
  }
  cross.sort((a, b) => b[0] - a[0]);
  const over = cross.filter((x) => x[0] >= 0.15);
  console.log(`\n② 러닝트래블과 — 낱말 3개 묶음이 그쪽 한 페이지에 들어 있는 비율. 0.15 이상 ${over.length}편 (최고 ${cross[0] ? cross[0][0].toFixed(2) : 0})`);
  cross.slice(0, 20).forEach(([s, a, b]) => console.log(`  ${s.toFixed(2)}  ${a}  ↔  ${b}`));
} else console.log("\n② 러닝트래블 docs 폴더가 없어 건너뜀");

const avg = (l) => (l.length ? l.reduce((a, x) => a + x[0], 0) / l.length : 0);
console.log(`\n평균 — 러닝트래블 대비 ${avg(cross).toFixed(3)}`);
if (inside.some((x) => x[0] >= 0.4) || cross.some((x) => x[0] >= 0.3)) { console.error("✗ 너무 겹치는 글이 있습니다"); process.exitCode = 1; }
