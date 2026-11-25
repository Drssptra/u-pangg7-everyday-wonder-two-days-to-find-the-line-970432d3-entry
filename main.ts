// Everyday Wonder, Two Days to Find the Line
// Entry generator: assembles the one-line entry from word fragments,
// validates it against the competition gate (1-200 characters, one line),
// and writes it to $MAKEFUN_OUTPUT_DIR/entry.txt with no trailing newline.
//
// Node 22 stdlib only. No network, no randomness, no side effects
// beyond writing entry.txt and printing the entry to stdout.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The entry, kept as fragments so the assembly step is explicit and
// a stray edit to any single word is easy to spot in review.
const FRAGMENTS: readonly string[] = [
  "The automatic supermarket door opened for a dry leaf,",
  "and for a second autumn was treated as a customer.",
];

const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 200;

function assembleEntry(parts: readonly string[]): string {
  return parts.join(" ");
}

function fail(message: string): never {
  process.stderr.write(`entry rejected: ${message}\n`);
  process.exit(1);
}

// Validation works on Unicode code points (not UTF-16 code units),
// so the character count matches what a human reader counts.
function validateEntry(text: string): void {
  const chars = [...text];
  if (chars.length < GATE_MIN_CHARS || chars.length > GATE_MAX_CHARS) {
    fail(
      `length ${chars.length} chars is outside the ${GATE_MIN_CHARS}-${GATE_MAX_CHARS} gate`,
    );
  }
  if (text.trim().length === 0) {
    fail("entry is blank");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be a single line");
  }
  if (text !== text.trim()) {
    fail("entry has leading or trailing whitespace");
  }
}

function outputDir(): string {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  if (raw === undefined || raw.trim() === "") {
    return "/output";
  }
  return resolve(raw);
}

function main(): void {
  const entry = assembleEntry(FRAGMENTS);
  validateEntry(entry);

  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, entry, { encoding: "utf8", flag: "w" });

  // Read-back verification: the file on disk must be byte-for-byte
  // identical to the validated entry. Any drift (extra newline, a
  // truncated write, an encoding surprise) is a hard failure.
  const onDisk = readFileSync(target, "utf8");
  if (onDisk !== entry) {
    fail(
      `read-back mismatch: wrote ${Buffer.byteLength(entry, "utf8")} bytes, ` +
        `read back ${Buffer.byteLength(onDisk, "utf8")} bytes`,
    );
  }
  if (Buffer.byteLength(onDisk, "utf8") !== Buffer.byteLength(entry, "utf8")) {
    fail("read-back byte length differs from entry byte length");
  }

  process.stdout.write(`${entry}\n`);
}

main();
