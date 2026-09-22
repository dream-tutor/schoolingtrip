// 스쿨링트립 — 정적 사이트(docs/)를 내보내는 얇은 워커.
//   하는 일은 셋뿐: www → 대표 도메인 301, /a.html 을 리디렉션 없이 내보내기, 나머지는 에셋 그대로.
//   내용·SEO 는 전부 build.js 가 docs/ 에 구워 둔다. 여기에 로직을 더 넣지 말 것.
const CANONICAL_HOST = "schoolingtrip.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "www." + CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    // 정적 에셋 기본 동작(html_handling)은 /a.html 을 /a 로 307 보낸다.
    // 이 사이트는 내부 링크·canonical·sitemap 이 전부 .html 이라 그대로 200 으로 내보낸다.
    if (url.pathname.endsWith(".html")) {
      if (url.pathname === "/index.html") {
        url.pathname = "/";
        return Response.redirect(url.toString(), 301); // 홈은 sitemap·canonical 이 "/" 라 여기로 모은다
      }
      const inner = new URL(url);
      inner.pathname = url.pathname.slice(0, -".html".length);
      return env.ASSETS.fetch(new Request(inner, request));
    }

    return env.ASSETS.fetch(request);
  },
};
