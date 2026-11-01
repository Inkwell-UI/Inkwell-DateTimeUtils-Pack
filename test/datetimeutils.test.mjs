// Checks every template against its node definition, then evaluates each rendered expression in JS (the expressions are
// valid in both JS and AS2) against known answers. Uses the Core Pack's test renderer: inputs become IN_<pin>.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPack, checkTemplate, render, fixtureFields } from "@inkwell-ui/core-pack/scripts/lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { manifest, nodes } = loadPack(root);
const byKind = Object.fromEntries(nodes.map((n) => [n.def.kind, n]));

test("every template agrees with its pins and fields", () => {
  for (const n of nodes) assert.deepEqual(checkTemplate(n.def, n.text, manifest.id), [], n.id);
});

test("every node is pure, category Time, one 'value' output", () => {
  assert.equal(nodes.length, 10);
  for (const n of nodes) {
    assert.equal(n.def.pure, true, n.id);
    assert.equal(n.def.category, "Time", n.id);
    assert.deepEqual(n.def.outputs.map((o) => o.name), ["value"], n.id);
  }
});

const run = (kind, inputs, fields = {}) => {
  const { def, text } = byKind[kind];
  const expr = render(def, text, { ...fixtureFields(def), ...fields }).split("\n")[1];
  const names = def.inputs.map((p) => p.name);
  return new Function(...names.map((n) => "IN_" + n), `return ${expr};`)(...names.map((n) => inputs[n] ?? def.inputs.find((p) => p.name === n).default));
};

const cases = [
  ["FormatDuration", { seconds: 0 }, {}, "0:00"],
  ["FormatDuration", { seconds: 65 }, {}, "1:05"],
  ["FormatDuration", { seconds: 3600 }, {}, "1:00:00"],
  ["FormatDuration", { seconds: 3725 }, {}, "1:02:05"],
  ["FormatDuration", { seconds: 5 }, { alwaysHours: true }, "0:00:05"],
  ["FormatDuration", { seconds: -3 }, {}, "0:00"],
  ["FormatDuration", { seconds: NaN }, {}, "0:00"],
  ["FormatDuration", { seconds: Infinity }, {}, "0:00"],
  ["FormatDuration", { seconds: 59.999 }, { decimals: 2 }, "0:59.99"],
  ["FormatDuration", { seconds: 1.15 }, { decimals: 2 }, "0:01.15"],
  ["FormatDuration", { seconds: 90061.5 }, { decimals: 1 }, "25:01:01.5"],
  ["GetDurationPart", { seconds: 93784 }, { part: "days" }, 1],
  ["GetDurationPart", { seconds: 93784 }, { part: "hours" }, 2],
  ["GetDurationPart", { seconds: 93784 }, { part: "minutes" }, 3],
  ["GetDurationPart", { seconds: 93784 }, { part: "seconds" }, 4],
  ["GetDurationPart", { seconds: -50 }, { part: "seconds" }, 0],
  ["GetDurationPart", { seconds: 59.9 }, { part: "seconds" }, 59],
  ["ToSeconds", { hours: 1, minutes: 2, seconds: 3 }, {}, 3723],
  ["ToSeconds", { hours: NaN, minutes: 1, seconds: 0 }, {}, 0],
  ["FormatTimeOfDay", { hour: 15.5 }, {}, "3:30 PM"],
  ["FormatTimeOfDay", { hour: 15.5 }, { clock: "24h" }, "15:30"],
  ["FormatTimeOfDay", { hour: 0 }, {}, "12:00 AM"],
  ["FormatTimeOfDay", { hour: 12 }, {}, "12:00 PM"],
  ["FormatTimeOfDay", { hour: 24 }, {}, "12:00 AM"],
  ["FormatTimeOfDay", { hour: -1 }, {}, "11:00 PM"],
  ["FormatTimeOfDay", { hour: 9.05 }, { clock: "24h" }, "09:03"],
  ["FormatTimeOfDay", { hour: NaN }, {}, "12:00 AM"],
  ["FormatTimeAgo", { seconds: 30 }, {}, "just now"],
  ["FormatTimeAgo", { seconds: 60 }, {}, "1m ago"],
  ["FormatTimeAgo", { seconds: 7200 }, {}, "2h ago"],
  ["FormatTimeAgo", { seconds: 172800 }, {}, "2d ago"],
  ["FormatTimeAgo", { seconds: -5 }, {}, "just now"],
  ["MonthName", { month: 1 }, {}, "January"],
  ["MonthName", { month: 12 }, { style: "short" }, "Dec"],
  ["MonthName", { month: 0 }, {}, ""],
  ["MonthName", { month: 13 }, {}, ""],
  ["MonthName", { month: NaN }, {}, ""],
  ["WeekdayName", { weekday: 0 }, {}, "Sunday"],
  ["WeekdayName", { weekday: 6 }, { style: "short" }, "Sat"],
  ["WeekdayName", { weekday: 7 }, {}, ""],
  ["WeekdayName", { weekday: -1 }, {}, ""],
];

for (const [kind, inputs, fields, want] of cases) {
  test(`${kind} ${JSON.stringify(inputs)} ${JSON.stringify(fields)}`, () => assert.deepEqual(run(kind, inputs, fields), want));
}

const SUN = 1793565091; // 2026-11-01 20:31:31 UTC, a Sunday (the value the in-game Date spike showed)
const dateCases = [
  ["GetDatePart", { timestamp: 0 }, { part: "year" }, 1970],
  ["GetDatePart", { timestamp: 0 }, { part: "month" }, 1],
  ["GetDatePart", { timestamp: 0 }, { part: "day" }, 1],
  ["GetDatePart", { timestamp: 0 }, { part: "weekday" }, 4],
  ["GetDatePart", { timestamp: 0 }, { part: "dayOfYear" }, 1],
  ["GetDatePart", { timestamp: 1709164800 }, { part: "year" }, 2024],
  ["GetDatePart", { timestamp: 1709164800 }, { part: "month" }, 2],
  ["GetDatePart", { timestamp: 1709164800 }, { part: "day" }, 29],
  ["GetDatePart", { timestamp: 1709164800 }, { part: "weekday" }, 4],
  ["GetDatePart", { timestamp: 1709164800 }, { part: "dayOfYear" }, 60],
  ["GetDatePart", { timestamp: SUN }, { part: "hour" }, 20],
  ["GetDatePart", { timestamp: SUN }, { part: "minute" }, 31],
  ["GetDatePart", { timestamp: SUN }, { part: "second" }, 31],
  ["GetDatePart", { timestamp: SUN }, { part: "weekday" }, 0],
  ["GetDatePart", { timestamp: SUN }, { part: "dayOfYear" }, 305],
  ["GetDatePart", { timestamp: 1735603200 }, { part: "dayOfYear" }, 366], // 2024-12-31, a leap year
  ["GetDatePart", { timestamp: -5 }, { part: "year" }, 1970],
  ["GetDatePart", { timestamp: NaN }, { part: "year" }, 1970],
  ["GetDatePart", { timestamp: 86399.9 }, { part: "hour" }, 23],
  ["MakeTimestamp", { year: 2024, month: 2, day: 29, hour: 0, minute: 0, second: 0 }, {}, 1709164800],
  ["MakeTimestamp", {}, {}, 0],
  ["MakeTimestamp", { year: 2024, month: 13, day: 1 }, {}, 1735689600],
  ["MakeTimestamp", { year: NaN }, {}, 0],
];

for (const [kind, inputs, fields, want] of dateCases) {
  test(`${kind} ${JSON.stringify(inputs)} ${JSON.stringify(fields)}`, () => assert.deepEqual(run(kind, inputs, fields), want));
}

test("Get Date Part in local time agrees with the JS local Date", () => {
  const d = new Date(SUN * 1000);
  for (const [part, want] of [["year", d.getFullYear()], ["month", d.getMonth() + 1], ["day", d.getDate()], ["hour", d.getHours()], ["weekday", d.getDay()]])
    assert.equal(run("GetDatePart", { timestamp: SUN }, { part, utc: false }), want, part);
});

test("Make Timestamp and Get Date Part round-trip", () => {
  const t = run("MakeTimestamp", { year: 2031, month: 7, day: 4, hour: 13, minute: 5, second: 9 });
  const parts = ["year", "month", "day", "hour", "minute", "second"].map((part) => run("GetDatePart", { timestamp: t }, { part }));
  assert.deepEqual(parts, [2031, 7, 4, 13, 5, 9]);
});

test("Now is a whole-second timestamp near the real time, and volatile (never cached)", () => {
  const n = run("Now", {});
  assert.equal(n, Math.floor(n));
  assert.ok(Math.abs(n - Date.now() / 1000) < 2);
  assert.equal(byKind.Now.def.extra?.volatile, true);
});

// The Date class works in Skyrim (samples/menu-date-spike, 2026-11-01), but only these three nodes need it.
test("only Now, Get Date Part and Make Timestamp use the Date class", () => {
  for (const n of nodes) assert.equal(/\bDate\b/.test(n.text), ["Now", "GetDatePart", "MakeTimestamp"].includes(n.def.kind), n.id);
});
