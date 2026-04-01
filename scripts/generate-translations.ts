/**
 * One-time offline script to generate multilingual translations for all static deck cards.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-translations.ts
 *
 * Prerequisites:
 *   npm install @anthropic-ai/sdk
 *   (or: npx --yes @anthropic-ai/sdk ...)
 *
 * Language decks (8 files): adds front_translations only — back = target-language word, unchanged.
 * Subject decks (11 files): adds front_translations AND back_translations.
 * Deck metadata (decks.ts): adds name_translations + description_translations.
 *
 * Resumes from .translation-checkpoint.json if interrupted.
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const LANGUAGES = ['de', 'fr', 'tr', 'nl', 'ru', 'zh', 'pt_BR', 'pt_PT'] as const;
type Lang = (typeof LANGUAGES)[number];
type TranslationMap = Partial<Record<Lang, string>>;

const CHECKPOINT_FILE = path.join(__dirname, '.translation-checkpoint.json');
const DATA_DIR = path.join(__dirname, '../src/data/publicDecks');

const LANGUAGE_FILES: Record<string, string> = {
  'deck-german-vocab':  path.join(DATA_DIR, 'languages/german.ts'),
  'deck-spanish-vocab': path.join(DATA_DIR, 'languages/spanish.ts'),
  'deck-french-vocab':  path.join(DATA_DIR, 'languages/french.ts'),
  'deck-turkish-vocab': path.join(DATA_DIR, 'languages/turkish.ts'),
  'deck-dutch-vocab':   path.join(DATA_DIR, 'languages/dutch.ts'),
  'deck-russian-vocab': path.join(DATA_DIR, 'languages/russian.ts'),
  'deck-arabic-vocab':  path.join(DATA_DIR, 'languages/arabic.ts'),
  'deck-chinese-vocab': path.join(DATA_DIR, 'languages/chinese.ts'),
};

const SUBJECT_FILES: Record<string, string> = {
  'deck-anatomy':    path.join(DATA_DIR, 'subjects/anatomy.ts'),
  'deck-physics':    path.join(DATA_DIR, 'subjects/physics.ts'),
  'deck-chemistry':  path.join(DATA_DIR, 'subjects/chemistry.ts'),
  'deck-biology':    path.join(DATA_DIR, 'subjects/biology.ts'),
  'deck-history':    path.join(DATA_DIR, 'subjects/history.ts'),
  'deck-business':   path.join(DATA_DIR, 'subjects/business.ts'),
  'deck-math':       path.join(DATA_DIR, 'subjects/math.ts'),
  'deck-medical':    path.join(DATA_DIR, 'subjects/medical.ts'),
  'deck-technology': path.join(DATA_DIR, 'subjects/technology.ts'),
  'deck-psychology': path.join(DATA_DIR, 'subjects/psychology.ts'),
  'deck-mcat':       path.join(DATA_DIR, 'subjects/mcat.ts'),
};

// ── Checkpoint ────────────────────────────────────────────────────────────────

function loadCheckpoint(): Record<string, TranslationMap> {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
  }
  return {};
}

function saveCheckpoint(data: Record<string, TranslationMap>): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2));
}

// ── Card extraction ───────────────────────────────────────────────────────────

interface CardLine {
  lineIndex: number;
  id: string;
  front: string;
  back: string;
  hasFrontTrans: boolean;
  hasBackTrans: boolean;
}

function extractCards(lines: string[]): CardLine[] {
  const result: CardLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idM = line.match(/\bid:\s*['"`]([^'"`]+)['"`]/);
    const frontM = line.match(/\bfront:\s*['"`]([^'"`]*)['"`]/);
    const backM = line.match(/\bback:\s*['"`]([^'"`]*)['"`]/);
    if (idM && frontM && backM) {
      result.push({
        lineIndex: i,
        id: idM[1],
        front: frontM[1],
        back: backM[1],
        hasFrontTrans: line.includes('front_translations'),
        hasBackTrans: line.includes('back_translations'),
      });
    }
  }
  return result;
}

// ── Line patching ─────────────────────────────────────────────────────────────

function injectIntoLine(
  line: string,
  frontTrans: TranslationMap | null,
  backTrans: TranslationMap | null
): string {
  let result = line;

  if (frontTrans && !line.includes('front_translations')) {
    const serialized = JSON.stringify(frontTrans);
    // Insert front_translations after `back: '...'`
    result = result.replace(
      /(,\s*back:\s*['"`][^'"`]*['"`])/,
      `$1, front_translations: ${serialized}`
    );
  }

  if (backTrans && !line.includes('back_translations')) {
    const serialized = JSON.stringify(backTrans);
    // Insert back_translations after front_translations (or after back if no front_translations)
    if (result.includes('front_translations')) {
      result = result.replace(
        /(front_translations:\s*\{[^}]*\})/,
        `$1, back_translations: ${serialized}`
      );
    } else {
      result = result.replace(
        /(,\s*back:\s*['"`][^'"`]*['"`])/,
        `$1, back_translations: ${serialized}`
      );
    }
  }

  return result;
}

// ── Claude API batching ───────────────────────────────────────────────────────

async function translateBatch(
  client: Anthropic,
  texts: Record<string, string>,
  batchSize: number
): Promise<Record<string, TranslationMap>> {
  const keys = Object.keys(texts);
  const results: Record<string, TranslationMap> = {};

  for (let i = 0; i < keys.length; i += batchSize) {
    const chunk = keys.slice(i, i + batchSize);
    const input: Record<string, string> = {};
    for (const k of chunk) input[k] = texts[k];

    const prompt = `Translate each text into: de (German), fr (French), tr (Turkish), nl (Dutch), ru (Russian), zh (Simplified Chinese), pt_BR (Brazilian Portuguese), pt_PT (European Portuguese).

Return ONLY valid JSON, no markdown:
{"card-id": {"de":"...","fr":"...","tr":"...","nl":"...","ru":"...","zh":"...","pt_BR":"...","pt_PT":"..."}, ...}

Cards: ${JSON.stringify(input)}`;

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = (msg.content[0] as any).text as string;
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```[a-z]*\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as Record<string, TranslationMap>;
    Object.assign(results, parsed);

    process.stdout.write(
      `  batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keys.length / batchSize)} done\n`
    );
    // Avoid rate limits
    await new Promise((r) => setTimeout(r, 200));
  }

  return results;
}

// ── Process one deck file ─────────────────────────────────────────────────────

async function processDeckFile(
  client: Anthropic,
  filePath: string,
  translateBack: boolean,
  checkpoint: Record<string, TranslationMap>
): Promise<void> {
  if (!fs.existsSync(filePath)) {
    console.log(`  Skipping (file not found): ${filePath}`);
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const cards = extractCards(lines);

  const frontsNeeded: Record<string, string> = {};
  const backsNeeded: Record<string, string> = {};

  for (const card of cards) {
    if (!card.hasFrontTrans && !checkpoint[`f:${card.id}`]) {
      frontsNeeded[`f:${card.id}`] = card.front;
    }
    if (translateBack && !card.hasBackTrans && !checkpoint[`b:${card.id}`]) {
      backsNeeded[`b:${card.id}`] = card.back;
    }
  }

  const totalNeeded = Object.keys(frontsNeeded).length + Object.keys(backsNeeded).length;
  if (totalNeeded === 0) {
    console.log('  All cards already translated.');
    return;
  }

  console.log(
    `  ${cards.length} cards — ${Object.keys(frontsNeeded).length} fronts, ` +
    `${Object.keys(backsNeeded).length} backs to translate`
  );

  if (Object.keys(frontsNeeded).length > 0) {
    const trans = await translateBatch(client, frontsNeeded, 50);
    Object.assign(checkpoint, trans);
    saveCheckpoint(checkpoint);
  }

  if (Object.keys(backsNeeded).length > 0) {
    const trans = await translateBatch(client, backsNeeded, 15);
    Object.assign(checkpoint, trans);
    saveCheckpoint(checkpoint);
  }

  // Patch lines
  for (const card of cards) {
    const frontTrans = checkpoint[`f:${card.id}`] ?? null;
    const backTrans = translateBack ? (checkpoint[`b:${card.id}`] ?? null) : null;
    if (frontTrans || backTrans) {
      lines[card.lineIndex] = injectIntoLine(lines[card.lineIndex], frontTrans, backTrans);
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`  Saved.`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: set ANTHROPIC_API_KEY environment variable first.');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const checkpoint = loadCheckpoint();

  console.log('=== Language decks (front translations only) ===');
  for (const [deckId, filePath] of Object.entries(LANGUAGE_FILES)) {
    console.log(`\n${deckId}`);
    await processDeckFile(client, filePath, false, checkpoint);
  }

  console.log('\n=== Subject decks (front + back translations) ===');
  for (const [deckId, filePath] of Object.entries(SUBJECT_FILES)) {
    console.log(`\n${deckId}`);
    await processDeckFile(client, filePath, true, checkpoint);
  }

  console.log('\n=== Done! ===');
  if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
