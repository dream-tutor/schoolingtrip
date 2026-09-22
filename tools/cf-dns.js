// ============================================================
// Cloudflare DNS 레코드 넣기 — Cloudflare Pages 커스텀 도메인용
//   실행: node tools/cf-dns.js            (지금 상태만 본다)
//         node tools/cf-dns.js --apply    (없는 레코드를 만든다)
//
//   토큰: 환경변수 CLOUDFLARE_DNS_TOKEN, 없으면 %TEMP%\cf-token.txt 첫 줄.
//   필요 권한: Zone:DNS:Edit + Zone:Zone:Read (해당 존만).
//   ⚠ wrangler OAuth 토큰에는 pages:write·zone:read 는 있어도 DNS 쓰기가 없다 —
//     그래서 Pages 에 커스텀 도메인을 붙여도 레코드는 자동으로 안 생기고 status=pending 에 머문다.
//     Cloudflare 대시보드에서 커스텀 도메인을 추가하면 UI 가 대신 만들어 준다.
//
// Cloudflare Pages 는 GitHub Pages 와 달리 **프록시를 켠(orange) CNAME** 을 쓴다.
// apex 는 CNAME flattening 으로 처리된다(A 레코드 필요 없음).
// ============================================================
const fs = require("fs");
const path = require("path");

const ZONE = process.env.CF_ZONE || "schoolingtrip.com";
const TARGET = process.env.CF_PAGES_HOST || "schoolingtrip.pages.dev";

function token() {
  if (process.env.CLOUDFLARE_DNS_TOKEN) return process.env.CLOUDFLARE_DNS_TOKEN.trim();
  const f = path.join(process.env.TEMP || process.env.TMP || ".", "cf-token.txt");
  if (fs.existsSync(f)) {
    const t = fs.readFileSync(f, "utf8").split(/\r?\n/)[0].trim();
    if (t) return t;
  }
  return null;
}

const T = token();
if (!T) {
  console.error("토큰이 없다. CLOUDFLARE_DNS_TOKEN 환경변수에 넣거나 %TEMP%\\cf-token.txt 첫 줄에 적을 것.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");

async function cf(url, init = {}) {
  const r = await fetch("https://api.cloudflare.com/client/v4" + url, {
    ...init,
    headers: { authorization: "Bearer " + T, "content-type": "application/json", ...(init.headers || {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!j.success) throw new Error(`${init.method || "GET"} ${url} → ${r.status} ${JSON.stringify(j.errors || j).slice(0, 300)}`);
  return j.result;
}

(async () => {
  const zones = await cf(`/zones?name=${encodeURIComponent(ZONE)}`);
  if (!zones.length) throw new Error(`존 ${ZONE} 을 이 토큰으로 볼 수 없다(존 범위 확인).`);
  const zid = zones[0].id;
  console.log(`존 ${ZONE} (${zid}) · 상태 ${zones[0].status}\n`);

  const have = await cf(`/zones/${zid}/dns_records?per_page=200`);
  const shown = have.filter((r) => ["A", "AAAA", "CNAME"].includes(r.type));
  console.log("지금 있는 레코드:");
  console.log(shown.length ? shown.map((r) => `  ${r.type.padEnd(5)} ${r.name.padEnd(28)} ${r.content}${r.proxied ? "  [프록시]" : ""}`).join("\n") : "  (없음)");

  // Pages 커스텀 도메인은 프록시 켠 CNAME 두 줄이면 끝난다.
  const want = [
    { type: "CNAME", name: ZONE, content: TARGET },
    { type: "CNAME", name: "www." + ZONE, content: TARGET },
  ];
  const missing = want.filter((w) => !have.some((r) => r.name === w.name && r.type === w.type && r.content === w.content));

  console.log(`\n넣어야 할 것 ${missing.length}건:`);
  console.log(missing.length ? missing.map((w) => `  ${w.type.padEnd(5)} ${w.name.padEnd(28)} ${w.content}  [프록시 켬]`).join("\n") : "  (없음 — 이미 다 있다)");

  if (!APPLY) { console.log("\n(--apply 를 붙이면 실제로 만든다)"); return; }
  for (const w of missing) {
    await cf(`/zones/${zid}/dns_records`, { method: "POST", body: JSON.stringify({ ...w, ttl: 1, proxied: true, comment: "Cloudflare Pages (schoolingtrip)" }) });
    console.log(`  + ${w.type} ${w.name} → ${w.content}`);
  }
  console.log("\n완료. Pages 커스텀 도메인 status 가 pending → active 로 바뀌면 끝이다.");
})().catch((e) => { console.error("실패: " + e.message); process.exit(1); });
