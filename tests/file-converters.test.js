import assert from "node:assert/strict";
import test from "node:test";
import { csvToJSON, jsonToCSV } from "../src/scripts/file-converters.js";

test("CSV to JSON handles quoted commas, escaped quotes, and embedded newlines", () => {
  const csv = 'name,note\r\n"ToolNest, Inc.","said ""hello"""\r\nA,"line one\nline two"\r\n';
  assert.deepEqual(csvToJSON(csv), [
    { name: "ToolNest, Inc.", note: 'said "hello"' },
    { name: "A", note: "line one\nline two" }
  ]);
});

test("CSV to JSON rejects malformed quoting and inconsistent row widths", () => {
  assert.throws(() => csvToJSON('name,note\nAda,"missing quote'), /unclosed quoted field/u);
  assert.throws(() => csvToJSON('name,note\nAda,ok"oops'), /quote in an unquoted field/u);
  assert.throws(() => csvToJSON("name,note\nAda"), /expected 2/u);
});

test("JSON to CSV escapes special values and fills missing columns", () => {
  const csv = jsonToCSV(JSON.stringify([
    { name: "ToolNest, Inc.", note: 'said "hello"', extra: "first\nsecond" },
    { name: "Ada", note: null }
  ]));
  assert.equal(csv, 'name,note,extra\r\n"ToolNest, Inc.","said ""hello""","first\nsecond"\r\nAda,,');
  assert.deepEqual(csvToJSON(csv), [
    { name: "ToolNest, Inc.", note: 'said "hello"', extra: "first\nsecond" },
    { name: "Ada", note: "", extra: "" }
  ]);
});

test("JSON to CSV validates its input shape", () => {
  assert.throws(() => jsonToCSV('{"name":"Ada"}'), /non-empty array of objects/u);
  assert.throws(() => jsonToCSV("[null]"), /Every item/u);
});
