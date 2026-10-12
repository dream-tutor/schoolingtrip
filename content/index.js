// 글 페이지 원고 모음 — content/pages-*.js 가 각각 페이지 객체 배열을 내보낸다.
//   틀은 build.js 의 buildArticle() 이 입힌다. 원고 쓰는 규칙은 content/WRITING.md.
//   CHECK_FILE=pages-05-x.js node build.js → 그 파일만 읽어 검사만 하고 끝낸다(docs/ 는 건드리지 않는다).
const fs = require("fs");
const path = require("path");
const only = process.env.CHECK_FILE;
const pages = [];
for (const f of fs.readdirSync(__dirname).filter((x) => /^pages-.*\.js$/.test(x) && (!only || x === only)).sort()) {
  const list = require(path.join(__dirname, f));
  if (!Array.isArray(list)) throw new Error(`${f}: 배열을 내보내야 합니다`);
  list.forEach((p) => pages.push({ ...p, _file: f }));
}
module.exports = pages;
