// 스쿨링트립 — 정적 사이트(docs/)를 내보내는 얇은 워커.
//   하는 일은 둘뿐: www → 대표 도메인 301, 나머지는 에셋 그대로.
//   내용·SEO 는 전부 build.js 가 docs/ 에 구워 둔다. 여기에 로직을 더 넣지 말 것.
const CANONICAL_HOST = "schoolingtrip.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www." + CANONICAL_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
