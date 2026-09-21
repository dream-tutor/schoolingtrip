// 실행: node tools/domcheck.js boardingtime.co.kr schoolingcamp.com 방학유학.kr …
// 도메인 등록 여부 조회
//  .com  : 베리사인 RDAP (404 = 미등록, 200 = 등록됨) — 레지스트리 공식 응답
//  .kr / .co.kr : 공개 RDAP 가 없어 DNS 위임 여부로 추정 (NXDOMAIN = 미등록 추정). 구매 직전 가비아에서 재확인 필요.
const dns = require("dns").promises;
const { domainToASCII } = require("url");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const names = process.argv.slice(2);
async function checkCom(d) {
  try {
    const r = await fetch(`https://rdap.verisign.com/com/v1/domain/${d}`, { headers: { accept: "application/rdap+json" } });
    if (r.status === 404) return "미등록";
    if (r.status === 200) { const j = await r.json(); const ev = (j.events || []).find((e) => e.eventAction === "registration"); return "등록됨" + (ev ? ` (${ev.eventDate.slice(0, 10)})` : ""); }
    return "확인불가 " + r.status;
  } catch (e) { return "확인불가 " + e.code; }
}
async function checkKr(d) {
  try { const ns = await dns.resolveNs(d); return "등록됨 (NS " + ns[0] + ")"; }
  catch (e) {
    if (e.code === "ENOTFOUND") return "미등록 추정";
    if (e.code === "ENODATA") { try { await dns.resolveSoa(d); return "등록됨 (NS 없음)"; } catch (e2) { return e2.code === "ENOTFOUND" ? "미등록 추정" : "확인불가 " + e2.code; } }
    return "확인불가 " + e.code;
  }
}
(async () => {
  for (const n of names) {
    const ascii = domainToASCII(n);
    const res = /\.com$/.test(ascii) ? await checkCom(ascii) : await checkKr(ascii);
    console.log(`${n.padEnd(28)} ${ascii !== n ? ("[" + ascii + "] ").padEnd(34) : "".padEnd(34)}${res}`);
  }
})();
