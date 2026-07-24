/**
 * 生命数字密码 · 前端渲染
 * 依赖: calculator.js + data-*.js
 */
import { calculateAll } from "./calculator.js";
import { numberInfo } from "./data-basic.js";
import { lifePathDescriptions } from "./data-lifepath.js";
import { restrictionDescriptions } from "./data-restriction.js";
import { personalYearDescriptions } from "./data-personalyear.js";
import { lineDescriptions, missingDescriptions } from "./data-grid.js";
import { birthdayDescriptions } from "./data-birthday.js";
import { talentDescriptions } from "./data-talent.js";

const $ = (id) => document.getElementById(id);
const numInfo = (n) => numberInfo[String(n)] || numberInfo["9"] || {};
const lp = (n) => lifePathDescriptions[String(n)] || lifePathDescriptions["9"];
const pyDesc = (n) => personalYearDescriptions[String(n)] || personalYearDescriptions["1"];
const restDesc = (n) => restrictionDescriptions[String(n)] || restrictionDescriptions["9"];

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ----------------------------- Toast ----------------------------- */
let toastTimer;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ----------------------------- 生成动画 ----------------------------- */
const GEN_STAGES = [
  { until: 25, name: "命数", msg: "汇集出生数字，推演命运之数…" },
  { until: 50, name: "天赋", msg: "解析天赋组合与潜能方向…" },
  { until: 75, name: "九宫", msg: "排布九宫连线，觉察能量格局…" },
  { until: 100, name: "流年", msg: "展望流年九循环的节律…" },
];

function runGenerate(done) {
  const bar = $("generateBar");
  const pctEl = $("generatePercent");
  const stageEl = $("generateStage");
  const msgEl = $("generateMessage");
  const timerEl = $("generateTimer");
  const steps = [...document.querySelectorAll(".generate-steps span")];
  const DURATION = 1150;
  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / DURATION);
    const pct = Math.round(t * 100);
    bar.style.width = pct + "%";
    pctEl.textContent = pct + "%";
    timerEl.textContent = ((t * DURATION) / 1000).toFixed(1) + "s";
    const st = GEN_STAGES.find((s) => pct <= s.until) || GEN_STAGES[GEN_STAGES.length - 1];
    stageEl.textContent = st.name + " · 推演中";
    msgEl.textContent = st.msg;
    const idx = GEN_STAGES.indexOf(st);
    steps.forEach((el, i) => {
      el.classList.remove("active", "done");
      if (i < idx) el.classList.add("done");
      else if (i === idx) el.classList.add("active");
    });
    if (t < 1) requestAnimationFrame(frame);
    else {
      steps.forEach((el) => {
        el.classList.remove("active");
        el.classList.add("done");
      });
      done();
    }
  }
  requestAnimationFrame(frame);
}

/* ----------------------------- 渲染：小组件 ----------------------------- */
function section(num, title, sub, inner) {
  return `<section class="section">
    <div class="section-head"><span class="section-num">${esc(num)}</span><h3 class="section-title">${esc(title)}</h3></div>
    ${sub ? `<p class="section-sub">${esc(sub)}</p>` : ""}
    ${inner}
  </section>`;
}

function tags(arr, cls) {
  return (arr || []).map((t) => `<span class="tag ${cls || ""}">${esc(t)}</span>`).join("");
}

function points(arr, cls) {
  return (arr || [])
    .map(
      (p) => `<div class="point ${cls}"><span class="k">${esc(p.k)}</span><span class="v">${esc(p.v)}</span></div>`
    )
    .join("");
}

/* ----------------------------- 渲染：各区块 ----------------------------- */
function renderSummary(r) {
  const curYear = new Date().getFullYear();
  const cells = [
    { label: "命数 · 命运数", value: r.lifePath, sub: lp(r.lifePath).title },
    { label: "天赋数", value: r.talentDisplay, sub: "" },
    { label: "生日数", value: r.birthDay, sub: numInfo(r.birthDay).name },
    { label: "限制数", value: r.restriction, sub: "童年习气" },
    { label: "流年数", value: r.personalYear, sub: `${curYear} ${pyDesc(r.personalYear).name}` },
    { label: "星座", value: r.zodiac.zodiac, small: true },
  ];
  return `<div class="summary-grid">${cells
    .map(
      (c) =>
        `<div class="summary-card"><div class="label">${esc(c.label)}</div><div class="value ${c.small ? "small" : ""}">${esc(
          c.value
        )}</div>${c.sub ? `<div class="sub">${esc(c.sub)}</div>` : ""}</div>`
    )
    .join("")}</div>`;
}

function renderShare(r) {
  const info = numInfo(r.lifePath);
  const tagsArr = [
    `天赋 ${r.talentDisplay}`,
    info.element ? `五行 ${info.element}` : "",
    info.symbol ? `数字符 ${info.symbol}` : "",
    r.zodiac.zodiac,
    info.type ? info.type : "",
  ].filter(Boolean);
  const pos = (info.positive || []).slice(0, 3);
  return `<div class="share-card">
    <p class="share-title">生 命 蓝 图</p>
    <p class="share-meta">命数 ${r.lifePath} · 生日数 ${r.birthDay} · 限制数 ${r.restriction}</p>
    <p class="share-headline">命数 ${r.lifePath} · ${esc(lp(r.lifePath).title)}</p>
    <div class="share-tags">${tagsArr.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}${tags(
    pos,
    "pos"
  )}</div>
  </div>`;
}

function renderInnate(r, year, month, day) {
  const stages = [r.innate.stage1, r.innate.stage2, r.innate.stage3];
  const ages = Object.values(r.stageAges);
  const names = ["型塑启蒙期", "产出壮年期", "丰收晚年期"];
  const sources = [`出生月（${month}）`, `出生日（${day}）`, `出生年（${year}）`];
  const inner = `<div class="summary-grid" style="grid-template-columns:repeat(3,1fr);">
    ${stages
      .map(
        (s, i) =>
          `<div class="summary-card"><div class="value">${s}</div><div class="sub" style="margin-top:6px;">${names[i]}</div><div class="sub" style="opacity:.7;">${sources[i]} → ${s}</div><div class="sub" style="opacity:.6;font-size:.66rem;margin-top:4px;">${ages[i]}</div></div>`
      )
      .join("")}
  </div>`;
  return section("段", "先天数 · 三个人生阶段", "出生月、日、年分别型塑三个养成阶段", inner);
}

function renderBirthday(r, day) {
  const desc = birthdayDescriptions[String(day)] || "";
  if (!desc) return "";
  const inner = `<div class="overview">${esc(desc)}</div>`;
  return section(r.birthDay, `出生日 ${day}（生日数 ${r.birthDay}）`, "出生日代表天性人格与行为表现，是成年阶段最突出的个人标签", inner);
}

function renderTalent(r) {
  const combo = talentDescriptions[String(r.talent)] || [];
  if (!combo.length) return "";
  const inner = `<div class="points">${combo
    .map((c) => `<div class="point gold"><span class="k">${esc(c.combo)}</span><span class="v">${esc(c.desc)}</span></div>`)
    .join("")}</div>`;
  return section(r.talentDisplay, `天赋数 ${r.talentDisplay} · 潜能开发`, "出生年月日所有数字相加的中间数，代表你的天赋潜能方向", inner);
}

function renderFrequency(r) {
  if (!r.dominant || !r.dominant.length) return "";
  const inner = `<div class="points">${r.dominant
    .map((d) => {
      const info = numInfo(d.digit);
      const pos = (info.positive || []).slice(0, 3).join("、");
      const neg = (info.negative || []).slice(0, 3).join("、");
      return `<div class="point gold"><span class="k">数字 ${d.digit}（${esc(info.name || "")}）出现 ${d.count} 次</span><span class="v">此数字能量过强，${esc(pos)} 等特征会非常突出，同时 ${esc(neg)} 等负面也会被放大。</span></div>`;
    })
    .join("")}</div>`;
  return section("频", "频率最多数", "出现 3 次及以上的数字，能量被强化", inner);
}

function renderLifePath(r) {
  const d = lp(r.lifePath);
  const info = numInfo(r.lifePath);
  const collapse = [
    { key: "essence", title: "深层解读 · 本质" },
    { key: "energy", title: "深层解读 · 能量" },
    { key: "interpersonal", title: "深层解读 · 人际" },
    { key: "love", title: "深层解读 · 感情" },
  ]
    .filter((c) => d[c.key])
    .map(
      (c) =>
        `<div class="collapse-head"><h4>${c.title}</h4><span class="arrow">▼</span></div>
         <div class="collapse-body"><div class="inner">${esc(d[c.key])}</div></div>`
    )
    .join("");

  let reactions = "";
  if (d.reactions) {
    reactions = `<div class="reactions" style="margin-top:6px;">${Object.entries(d.reactions)
      .map(([n, desc]) => `<div class="reaction"><span class="num">${esc(n)}</span><span>${esc(desc)}</span></div>`)
      .join("")}</div>`;
  }

  const inner = `
    <div class="overview">${esc(d.overview)}</div>
    <div class="traits">
      <div class="trait-group good"><h4>正面优势</h4><div class="trait-tags">${tags(info.positive, "pos")}</div></div>
      <div class="trait-group bad"><h4>负面挑战</h4><div class="trait-tags">${tags(info.negative, "neg")}</div></div>
    </div>
    <div class="points" style="margin-top:14px;">${points(d.success, "good")}</div>
    <div class="points">${points(d.sin, "bad")}</div>
    ${collapse}
    ${reactions}
  `;
  return section(r.lifePath, `命数 ${r.lifePath} · ${esc(d.title)}`, "人生角色定位与发展使命", inner);
}

function renderGrid(r) {
  const layout = [[3, 6, 9], [2, 5, 8], [1, 4, 7]];
  const grid = `<div class="grid-wrap"><div class="nine-grid">
    ${layout
      .flat()
      .map((n) => {
        const c = r.grid[n];
        const has = c > 0;
        const dots = has ? `<div class="dots">${"<span class='dot'></span>".repeat(c)}</div>` : "";
        return `<div class="cell ${has ? "has" : ""} ${has ? "" : "miss"}"><span class="n">${n}</span>${dots}</div>`;
      })
      .join("")}
  </div><div class="grid-axis"><span>灵</span><span>心</span><span>身</span></div></div>`;

  const activeLines = (r.lines.active || [])
    .map((l) => {
      const ld = lineDescriptions[l.name];
      if (!ld) return "";
      return `<div class="line"><div class="row"><span class="name">${l.name} <b>${esc(ld.name)}</b>（${esc(ld.posName)}）</span><span class="badge on">✓ 连通</span></div><div class="line-desc">${esc(ld.positive)}</div></div>`;
    })
    .join("");

  const brokenLines = (r.lines.inactive || [])
    .filter((l) => l.type === "main")
    .map((l) => {
      const ld = lineDescriptions[l.name];
      if (!ld) return "";
      return `<div class="line"><div class="row"><span class="name">${l.name} <b>${esc(ld.name)}</b></span><span class="badge off">✗ 断线</span></div><div class="line-desc">断线意味着 ${esc(ld.posName)} 方面有障碍与欠缺，是需关注与努力的部分。</div></div>`;
    })
    .join("");

  const missing = (r.missing || [])
    .map((m) => {
      const md = missingDescriptions[m];
      return md ? `<div class="missing"><h5>欠缺 ${m} · ${esc(md.title)}</h5><p>${esc(md.desc)}</p></div>` : "";
    })
    .join("");

  const inner = `${grid}
    <div class="line-list"><h4>连线分析</h4>${activeLines}${brokenLines}</div>
    ${missing ? `<div class="missing-list"><h4>空缺数</h4>${missing}</div>` : ""}`;

  return section("宫", "生日九宫图", "身（147）· 心（258）· 灵（369）", inner);
}

function renderRestriction(r) {
  const d = restDesc(r.restriction);
  const inner = `<div class="info-card">
    <h4>儿时受到的制约</h4><p>${esc(d.childhood)}</p>
    <h4>成长后的表现</h4><p>${esc(d.adult)}</p>
    <h4>解除「铃铛」法</h4><p class="cure">${esc(d.cure)}</p>
  </div>`;
  return section(r.restriction, `限制数 ${r.restriction} · 童年习气`, "出生月与日相加的总和，代表童年形成的制约模式", inner);
}

function renderPersonalYear(r) {
  const curYear = new Date().getFullYear();
  const timeline = (r.personalYears || [])
    .map((y) => {
      const isCur = y.year === curYear;
      const d = pyDesc(y.number);
      return `<div class="year ${isCur ? "cur" : ""}" data-py="${y.number}" data-year="${y.year}">
        <div class="yn">${y.number}</div><div class="yl">${esc(d.name || "")}</div><div class="yd">${y.year}</div></div>`;
    })
    .join("");

  const cur = pyDesc(r.personalYear);
  const detail = `<div class="year-detail show" id="pyDetail">
    <h4>${cur.icon || ""} 流年 ${r.personalYear} · ${esc(cur.name)}（${curYear}）</h4>
    <p><strong>正面：</strong>${esc(cur.positive)}</p>
    <p><strong>注意：</strong>${esc(cur.negative)}</p>
    <p><strong>健康：</strong>${esc(cur.health)}</p>
  </div>`;

  const inner = `<div class="timeline">${timeline}</div>${detail}`;
  return section(r.personalYear, `流年 ${r.personalYear} · ${esc(cur.name)} ${cur.icon || ""}`, `${curYear} 年流年 · 点击下方年份查看 9 年循环`, inner);
}

/* ----------------------------- 主渲染 ----------------------------- */
function render(r, year, month, day) {
  const html = [
    renderSummary(r),
    renderShare(r),
    renderInnate(r, year, month, day),
    renderBirthday(r, day),
    renderTalent(r),
    renderFrequency(r),
    renderLifePath(r),
    renderGrid(r),
    renderRestriction(r),
    renderPersonalYear(r),
  ].filter(Boolean).join("");

  const el = $("results");
  el.innerHTML = html;
  el.classList.add("show");
}

/* ----------------------------- 年份切换 ----------------------------- */
function selectYear(num, yearEl) {
  const d = pyDesc(num);
  const detail = $("pyDetail");
  if (!d || !detail) return;
  document.querySelectorAll(".year.cur").forEach((e) => e.classList.remove("cur"));
  yearEl.classList.add("cur");
  const year = yearEl.dataset.year;
  detail.innerHTML = `<h4>${d.icon || ""} 流年 ${num} · ${esc(d.name)}（${year}）</h4>
    <p><strong>正面：</strong>${esc(d.positive)}</p>
    <p><strong>注意：</strong>${esc(d.negative)}</p>
    <p><strong>健康：</strong>${esc(d.health)}</p>`;
  detail.classList.add("show");
}

/* ----------------------------- 事件 ----------------------------- */
function onSubmit() {
  const year = parseInt($("year").value, 10);
  const month = parseInt($("month").value, 10);
  const day = parseInt($("day").value, 10);
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2099) {
    toast("请输入有效的出生日期");
    return;
  }
  $("generateView").classList.remove("hidden");
  requestAnimationFrame(() => {
    runGenerate(() => {
      try {
        const r = calculateAll(year, month, day);
        render(r, year, month, day);
      } catch (err) {
        console.error(err);
        toast("计算出错：" + (err && err.message ? err.message : "未知错误"));
      } finally {
        $("generateView").classList.add("hidden");
      }
      const el = $("results");
      if (el.classList.contains("show")) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

$("calcBtn").addEventListener("click", onSubmit);
["year", "month", "day"].forEach((id) =>
  $(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") onSubmit();
  })
);

document.addEventListener("click", (e) => {
  const head = e.target.closest(".collapse-head");
  if (head) {
    const body = head.nextElementSibling;
    if (body && body.classList.contains("collapse-body")) {
      body.classList.toggle("open");
      head.classList.toggle("open");
    }
    return;
  }
  const yr = e.target.closest(".year");
  if (yr) selectYear(parseInt(yr.dataset.py, 10), yr);
});
