import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SENTENCE =
  "The lift mirror caught me mid-yawn, and for one floor I apologized to a stranger who turned out to be me.";

if (!SENTENCE.trim()) {
  process.stderr.write("error: entry is empty\n");
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), SENTENCE, "utf8");
process.stdout.write(SENTENCE + "\n");
