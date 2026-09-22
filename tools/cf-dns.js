// ============================================================
// Cloudflare DNS 레코드 넣기 — GitHub Pages 연결용
//   실행: node tools/cf-dns.js            (현재 상태만 보여준다)
//         node tools/cf-dns.js --apply    (없는 레코드를 만든다)
//
//   토큰: 환경변수 CLOUDFLARE_DNS_TOKEN, 없으면 %TEMP%\cf-token.txt 첫 줄.
//   필요 권한: Zone:DNS:Edit + Zone:Zone:Read (해당 존만). wrangler OAuth 토큰에는
//   zone(read) 뿐이라 이 작업이 안 된다 — 따로 만든 토큰이어야 한다.
//
// ⚠ 프록시는 반드시 꺼 둔다(proxied:false). 주황으로 켜면 GitHub 이 Let's Encrypt
//   인증서를 못 받아 'Enforce HTTPS' 가 계속 잠긴다. 인증서가 나온 뒤 켜려면 SSL 모드 Full.
// ============================================================
const fs = require("fs");
const path = require("path");

const ZONE = process.env.CF_ZONE || "schoolingtrip.com";
const PAGES_HOST = "dream-tutor.github.io";
// GitHub Pages apex 용 고정 IP (https://docs.github.com/pages 안내값)
const A = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"];
const AAAA = ["2606:50c0:8000::153", "2606:50c0:8001::153", "2606:50c0:8002::153", "2606:50c0:8003::153"];

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
  console.log(shown.length ? shown.map((r) => `  ${r.type.padEnd(5)} ${r.name.padEnd(28)} ${r.content}${r.proxied ? "  [프록시 켜짐 ⚠]" : ""}`).join("\n") : "  (없음)");

  const want = [
    ...A.map((c) => ({ type: "A", name: ZONE, content: c })),
    ...AAAA.map((c) => ({ type: "AAAA", name: ZONE, content: c })),
    { type: "CNAME", name: "www." + ZONE, content: PAGES_HOST },
  ];
  const missing = want.filter((w) => !have.some((r) => r.type === w.type && r.name === w.name && r.content === w.content));
  const proxiedHits = have.filter((r) => r.proxied && (r.name === ZONE || r.name === "www." + ZONE));

  console.log(`\n넣어야 할 것 ${missing.length}건:`);
  console.log(missing.length ? missing.map((w) => `  ${w.type.padEnd(5)} ${w.name.padEnd(28)} ${w.content}`).join("\n") : "  (없음 — 이미 다 있다)");
  if (proxiedHits.length) console.log(`\n⚠ 프록시가 켜진 레코드 ${proxiedHits.length}건 — GitHub 인증서 발급이 막힌다. 회색(DNS only)으로 바꿀 것.`);

  if (!APPLY) { console.log("\n(--apply 를 붙이면 실제로 만든다)"); return; }
  for (const w of missing) {
    await cf(`/zones/${zid}/dns_records`, { method: "POST", body: JSON.stringify({ ...w, ttl: 1, proxied: false, comment: "GitHub Pages (schoolingtrip)" }) });
    console.log(`  + ${w.type} ${w.name} ${w.content}`);
  }
  for (const r of proxiedHits) {
    await cf(`/zones/${zid}/dns_records/${r.id}`, { method: "PATCH", body: JSON.stringify({ proxied: false }) });
    console.log(`  ~ 프록시 끔: ${r.type} ${r.name}`);
  }
  console.log("\n완료. DNS 가 퍼지면 GitHub 이 인증서를 발급한다(보통 몇 분~15분).");
})().catch((e) => { console.error("실패: " + e.message); process.exit(1); });
