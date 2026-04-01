/**
 * Applies pre-generated translation JSON batches to static deck .ts files.
 *
 * Usage:
 *   npx tsx scripts/apply-translations.ts
 *
 * Reads all /tmp/synaps-trans-*.json files, merges them, then patches each deck .ts file
 * by injecting front_translations (and back_translations for subject decks) inline.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface TranslationMap {
  de?: string; fr?: string; tr?: string; nl?: string;
  ru?: string; zh?: string; pt_BR?: string; pt_PT?: string;
}

interface CardTranslations {
  front?: TranslationMap;
  back?: TranslationMap;
}

const DATA_DIR = path.join(__dirname, '../src/data/publicDecks');

const DECK_FILES: Record<string, string> = {
  'german':    path.join(DATA_DIR, 'languages/german.ts'),
  'spanish':   path.join(DATA_DIR, 'languages/spanish.ts'),
  'french':    path.join(DATA_DIR, 'languages/french.ts'),
  'turkish':   path.join(DATA_DIR, 'languages/turkish.ts'),
  'dutch':     path.join(DATA_DIR, 'languages/dutch.ts'),
  'russian':   path.join(DATA_DIR, 'languages/russian.ts'),
  'arabic':    path.join(DATA_DIR, 'languages/arabic.ts'),
  'chinese':   path.join(DATA_DIR, 'languages/chinese.ts'),
  'anatomy':   path.join(DATA_DIR, 'subjects/anatomy.ts'),
  'biology':   path.join(DATA_DIR, 'subjects/biology.ts'),
  'chemistry': path.join(DATA_DIR, 'subjects/chemistry.ts'),
  'physics':   path.join(DATA_DIR, 'subjects/physics.ts'),
  'history':   path.join(DATA_DIR, 'subjects/history.ts'),
  'business':  path.join(DATA_DIR, 'subjects/business.ts'),
  'math':      path.join(DATA_DIR, 'subjects/math.ts'),
  'medical':   path.join(DATA_DIR, 'subjects/medical.ts'),
  'technology':path.join(DATA_DIR, 'subjects/technology.ts'),
  'psychology':path.join(DATA_DIR, 'subjects/psychology.ts'),
  'mcat':      path.join(DATA_DIR, 'subjects/mcat.ts'),
};

function loadAllTranslations(): Record<string, CardTranslations> {
  const tmpDir = os.tmpdir();
  const merged: Record<string, CardTranslations> = {};

  const files = fs.readdirSync(tmpDir)
    .filter(f => f.startsWith('synaps-trans-') && f.endsWith('.json'))
    .map(f => path.join(tmpDir, f));

  console.log(`Found ${files.length} translation batch file(s)`);

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, CardTranslations>;
    for (const [id, trans] of Object.entries(data)) {
      if (!merged[id]) merged[id] = {};
      if (trans.front) merged[id].front = trans.front;
      if (trans.back) merged[id].back = trans.back;
    }
  }

  return merged;
}

function applyToFile(filePath: string, translations: Record<string, CardTranslations>): void {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let patchCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const idMatch = line.match(/\bid:\s*'(dc-[^']+)'/);
    if (!idMatch) continue;

    const cardId = idMatch[1];
    const trans = translations[cardId];
    if (!trans) continue;

    // Skip if already has translations
    if (line.includes('front_translations') || line.includes('back_translations')) continue;

    let insert = '';
    if (trans.front) insert += `, front_translations: ${JSON.stringify(trans.front)}`;
    if (trans.back) insert += `, back_translations: ${JSON.stringify(trans.back)}`;
    if (!insert) continue;

    // Insert before the last ' },' or '},' on the line
    const closingIdx = line.lastIndexOf('}');
    if (closingIdx === -1) continue;

    lines[i] = line.slice(0, closingIdx) + insert + line.slice(closingIdx);
    patchCount++;
  }

  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`  Patched ${patchCount} cards in ${path.basename(filePath)}`);
}

async function main(): Promise<void> {
  const translations = loadAllTranslations();
  const cardCount = Object.keys(translations).length;

  if (cardCount === 0) {
    console.error('No translation batch files found in /tmp. Run the translation agents first.');
    process.exit(1);
  }

  console.log(`Loaded translations for ${cardCount} cards`);

  for (const [name, filePath] of Object.entries(DECK_FILES)) {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${name} (file not found)`);
      continue;
    }
    // Check if this file has any of our translation keys
    const prefix = `dc-${name}-`;
    const hasCards = Object.keys(translations).some(id => id.startsWith(prefix));
    if (!hasCards) {
      console.log(`Skipping ${name} (no matching translations)`);
      continue;
    }
    console.log(`Processing ${name}...`);
    applyToFile(filePath, translations);
  }

  console.log('\nDone! You can now delete /tmp/synaps-trans-*.json files.');
}

main().catch(err => { console.error(err); process.exit(1); });
