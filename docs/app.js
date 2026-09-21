/* 캠프·유학 두 번째 사이트 — 화면 동작 (헤더·메뉴·등장 효과·전광판 모집 상태·포스터 끌기·일정 펼치기·상담 서랍) */
(function () {
  "use strict";
  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* 헤더 그림자 */
  var hd = $("#hd");
  function onScroll() { if (hd) hd.classList.toggle("s", window.scrollY > 12); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 모바일 메뉴 */
  var burger = $("#burger"), mnav = $("#mnav");
  function setMenu(on) {
    if (!burger || !mnav) return;
    burger.setAttribute("aria-expanded", on ? "true" : "false");
    burger.setAttribute("aria-label", on ? "메뉴 닫기" : "메뉴 열기");
    mnav.classList.toggle("on", on);
    d.body.style.overflow = on ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  if (mnav) mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });

  /* 등장 효과 */
  var rv = $$(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* 히어로 보딩패스 — 목적지 돌려 보이기 */
  var pass = $("#pass");
  if (pass) {
    var list = [];
    try { list = JSON.parse(pass.getAttribute("data-list") || "[]"); } catch (e) {}
    var slots = { to: $("[data-f=to]", pass), ko: $("[data-f=ko]", pass), date: $("[data-f=date]", pass), len: $("[data-f=len]", pass), who: $("[data-f=who]", pass), iso: $("[data-f=iso]", pass) };
    var i = 0, reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var show = function (n) {
      var it = list[n]; if (!it) return;
      Object.keys(slots).forEach(function (k) { if (slots[k]) slots[k].classList.add("out"); });
      setTimeout(function () {
        Object.keys(slots).forEach(function (k) { if (slots[k]) { slots[k].textContent = it[k]; slots[k].classList.remove("out"); } });
        pass.setAttribute("href", it.href);
      }, 330);
    };
    if (list.length > 1 && !reduce) setInterval(function () { if (d.hidden) return; i = (i + 1) % list.length; show(i); }, 3200);
  }

  /* 전광판 모집 상태 — 마감일이 지나면 문구만 바꾼다 (재빌드 없이도 맞게) */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  $$("[data-deadline]").forEach(function (el) {
    var p = (el.getAttribute("data-deadline") || "").split("-");
    if (p.length !== 3) return;
    var end = new Date(+p[0], +p[1] - 1, +p[2]);
    if (today > end) { el.classList.add("end"); el.textContent = el.getAttribute("data-closed") || "마감 · 문의"; }
  });

  /* 포스터 끌어서 넘기기 (마우스) */
  $$(".posters").forEach(function (sc) {
    var down = false, sx = 0, sl = 0, moved = false;
    sc.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = sc.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 6) { moved = true; sc.classList.add("drag"); }
      if (moved) sc.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; setTimeout(function () { sc.classList.remove("drag"); }, 0); });
    sc.addEventListener("dragstart", function (e) { e.preventDefault(); });
  });

  /* 일정표 펼치기 */
  $$(".iti").forEach(function (box) {
    var btn = $(".iti-more button", box);
    if (!btn) return;
    box.classList.add("clip");
    btn.addEventListener("click", function () { box.classList.add("open"); });
  });

  /* 상담 서랍 */
  var ov = $("#consultOv"), form = $("#consultForm"), fab = $("#fab");
  var lastFocus = null;
  function openConsult(preset) {
    if (!ov) return;
    lastFocus = d.activeElement;
    if (preset && form) {
      var sel = form.elements["관심과정"];
      if (sel) for (var k = 0; k < sel.options.length; k++) if (sel.options[k].value === preset) sel.selectedIndex = k;
    }
    ov.classList.add("on"); ov.setAttribute("aria-hidden", "false");
    d.body.style.overflow = "hidden";
    if (fab) fab.classList.add("hide");
    setMenu(false); d.body.style.overflow = "hidden";
    var first = $("input[name='이름']", ov); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 380);
  }
  function closeConsult() {
    if (!ov) return;
    ov.classList.remove("on"); ov.setAttribute("aria-hidden", "true");
    d.body.style.overflow = "";
    if (fab) fab.classList.remove("hide");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  d.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var a = e.target.closest('a[href$="#consult"]');
    if (a) { e.preventDefault(); openConsult(a.getAttribute("data-course") || (d.body.getAttribute("data-course") || "")); return; }
    if (e.target === ov || e.target.closest(".dr-x")) closeConsult();
  });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (ov && ov.classList.contains("on")) closeConsult(); else setMenu(false); } });
  if (location.hash === "#consult") openConsult(d.body.getAttribute("data-course") || "");

  if (form) {
    /* 학년 2단: 기타를 고르면 학년 칸 비활성 */
    var lv = form.elements["학교급"], gr = form.elements["학년수"];
    var GR = { "초등": 6, "중등": 3, "고등": 3 };
    var fillGrade = function () {
      if (!lv || !gr) return;
      var n = GR[lv.value] || 0;
      gr.innerHTML = '<option value="">학년</option>';
      for (var g = 1; g <= n; g++) gr.insertAdjacentHTML("beforeend", '<option value="' + g + '학년">' + g + "학년</option>");
      gr.disabled = !n;
    };
    if (lv) { lv.addEventListener("change", fillGrade); fillGrade(); }

    var agree = form.elements["개인정보동의"];
    if (agree) agree.addEventListener("click", function () {
      if (!agree.checked) { alert("체크를 해제하시면 상담 신청이 어렵습니다."); agree.checked = true; }
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = new FormData(form);
      var name = (f.get("이름") || "").trim();
      var pre = f.get("연락처앞") || "010";
      var raw = String(f.get("연락처") || "").replace(/\D/g, "");
      if (!name) { alert("학생 이름을 입력해 주세요."); return; }
      if (raw.length < 7) { alert("연락처를 확인해 주세요."); return; }
      if (!f.get("개인정보동의")) { alert("개인정보 수집·이용에 동의해 주세요."); return; }
      var tel = raw.length === 11 ? raw.slice(0, 3) + "-" + raw.slice(3, 7) + "-" + raw.slice(7)
        : raw.length === 10 ? raw.slice(0, 3) + "-" + raw.slice(3, 6) + "-" + raw.slice(6)
        : raw.length === 8 ? pre + "-" + raw.slice(0, 4) + "-" + raw.slice(4)
        : raw.length === 7 ? pre + "-" + raw.slice(0, 3) + "-" + raw.slice(3) : pre + "-" + raw;
      var level = f.get("학교급") || "", gnum = f.get("학년수") || "";
      var grade = level === "기타" ? "기타" : (level + " " + gnum).trim();
      var NL = String.fromCharCode(10), rows = [];
      if (f.get("영어수준")) rows.push("영어 수준: " + f.get("영어수준"));
      if (f.get("해외경험")) rows.push("해외 경험: " + f.get("해외경험"));
      if (f.getAll("궁금한점").length) rows.push("상담 희망 내용: " + f.getAll("궁금한점").join(", "));
      var free = (f.get("문의내용") || "").trim();
      if (free) rows.push((rows.length ? NL : "") + free);
      /* 러닝트래블과 시트를 같이 쓴다 — 어느 사이트 접수인지 문의내용 첫 줄에 적는다(더세이브 공용 시트와 같은 방식) */
      var siteTag = form.getAttribute("data-site") || "";
      if (siteTag) rows.unshift("[" + siteTag + "]");
      var data = {
        "이름": name, "연락처": tel, "학년": grade, "관심캠프": f.get("관심과정") || "",
        "문의내용": rows.join(NL),
        "신청일": new Date().toLocaleString("ko-KR"),
        "유입페이지": location.href, "유입페이지제목": d.title,
        "유입경로": d.referrer || "직접입력"
      };
      var btn = $(".fm-go", form);
      btn.disabled = true; btn.textContent = "접수 중…";
      var EP = form.getAttribute("data-ep") || "";
      if (EP) {
        var qs = Object.keys(data).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]); }).join("&");
        var img = new Image(); img.src = EP + "?" + qs; /* t.js 가 이 요청을 문의 접수로 집계한다 */
      } else if (window.console) console.warn("formEndpoint 미설정 — 데모 모드(전송하지 않음)");
      setTimeout(function () {
        form.hidden = true;
        var done = $("#consultDone"); if (done) { done.hidden = false; done.focus && done.focus(); }
      }, 700);
    });
  }
})();
