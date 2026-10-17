// Eva's Moon Notes — Scriptable 小组件
const SITE = "https://ewvava.github.io/moon-notes/";
const DATA_URL = SITE + "data.json";
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.documentsDirectory(), "moon-notes-data.json");

async function loadData() {
  try {
    const json = await new Request(DATA_URL + "?t=" + Date.now()).loadJSON();
    fm.writeString(cachePath, JSON.stringify(json));
    return json;
  } catch (e) {
    if (fm.fileExists(cachePath)) return JSON.parse(fm.readString(cachePath));
    return null;
  }
}

const p2 = n => String(n).padStart(2, "0");
const todayKey = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const WD = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MON = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const BG = new Color("#F7F5F1"), INK = new Color("#2F2B43"), SUB = new Color("#8C87A6");
const BLUE = new Color("#6F80E0"), ROSE = new Color("#E8828B"), APRICOT = new Color("#E6A85C");
const BODY = new Color("#4A463F"), LINE = new Color("#8C87A6", 0.18);

function txt(parent, s, font, color) {
  const t = parent.addText(s);
  t.font = font; t.textColor = color;
  return t;
}

function buildMedium(d, now) {
  const w = new ListWidget();
  w.backgroundColor = BG;
  w.setPadding(12, 16, 11, 16);

  const head = w.addStack();
  head.bottomAlignContent();
  txt(head, String(now.getDate()), Font.boldRoundedSystemFont(27), INK);
  head.addSpacer(7);
  const eb = txt(head, `${WD[now.getDay()]} · ${MON[now.getMonth()]}`, Font.semiboldRoundedSystemFont(10), SUB);
  eb.lineLimit = 1;
  head.addSpacer();
  txt(head, "☽ " + d.moon, Font.mediumRoundedSystemFont(10), SUB);

  w.addSpacer(8);
  const tiles = w.addStack();
  tiles.backgroundColor = Color.white();
  tiles.cornerRadius = 12;
  tiles.setPadding(7, 4, 8, 4);
  tiles.centerAlignContent();
  const items = [["宜", d.yi, BLUE], ["忌", d.ji, ROSE], ["今日忠告", d.tip, APRICOT]];
  items.forEach((it, i) => {
    if (i > 0) {
      const sep = tiles.addStack();
      sep.size = new Size(1, 30);
      sep.backgroundColor = LINE;
    }
    tiles.addSpacer();
    const cell = tiles.addStack();
    cell.layoutVertically();
    cell.centerAlignContent();
    const l = txt(cell, it[0], Font.systemFont(9), SUB);
    l.centerAlignText();
    cell.addSpacer(3);
    const v = txt(cell, it[1], Font.semiboldRoundedSystemFont(13), it[2]);
    v.centerAlignText(); v.lineLimit = 1; v.minimumScaleFactor = 0.7;
    tiles.addSpacer();
  });

  w.addSpacer(8);
  const t = txt(w, d.first, Font.systemFont(12), BODY);
  t.lineLimit = 2;
  return w;
}

function buildSmall(d, now) {
  const w = new ListWidget();
  w.backgroundColor = BG;
  w.setPadding(14, 14, 12, 14);
  txt(w, `${WD[now.getDay()].slice(0, 3)} · ${MON[now.getMonth()].slice(0, 3)} ${now.getDate()}`, Font.semiboldRoundedSystemFont(10), SUB);
  w.addSpacer(8);
  [["宜", d.yi, BLUE], ["忌", d.ji, ROSE], ["忠告", d.tip, APRICOT]].forEach((it, i) => {
    if (i > 0) {
      const sep = w.addStack();
      sep.size = new Size(0, 1);
      sep.backgroundColor = LINE;
    }
    w.addSpacer(i > 0 ? 7 : 0);
    const row = w.addStack();
    row.centerAlignContent();
    txt(row, it[0], Font.systemFont(10), SUB);
    row.addSpacer();
    const v = txt(row, it[1], Font.semiboldRoundedSystemFont(14), it[2]);
    v.lineLimit = 1; v.minimumScaleFactor = 0.7;
    w.addSpacer(7);
  });
  return w;
}

const data = await loadData();
const now = new Date();
const d = data ? data[todayKey(now)] : null;
let widget;
if (!d) {
  widget = new ListWidget();
  widget.backgroundColor = BG;
  txt(widget, "暂时没有今天的内容", Font.systemFont(13), SUB);
} else {
  widget = config.widgetFamily === "small" ? buildSmall(d, now) : buildMedium(d, now);
}
widget.url = SITE;
const next = new Date();
next.setDate(next.getDate() + 1);
next.setHours(0, 5, 0, 0);
widget.refreshAfterDate = next;

if (config.runsInWidget) {
  Script.setWidget(widget);
} else if (config.widgetFamily === "small") {
  await widget.presentSmall();
} else {
  await widget.presentMedium();
}
Script.complete();
