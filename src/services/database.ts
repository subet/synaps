import * as SQLite from 'expo-sqlite';
import { Card, CardStatus, Deck, StreakDay, StudySession } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('synaps.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      parent_deck_id TEXT,
      icon TEXT,
      color TEXT,
      new_cards_per_day INTEGER DEFAULT 20,
      shuffle_cards INTEGER DEFAULT 1,
      auto_play_audio INTEGER DEFAULT 0,
      reverse_cards INTEGER DEFAULT 0,
      is_public_download INTEGER DEFAULT 0,
      source_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      front_image TEXT,
      back_image TEXT,
      audio_url TEXT,
      tags TEXT,
      status TEXT DEFAULT 'new',
      ease_factor REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      due_date TEXT,
      last_reviewed TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      cards_studied INTEGER DEFAULT 0,
      cards_correct INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS streaks (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      cards_studied INTEGER DEFAULT 0
    );
  `);
}

// ─── Decks ────────────────────────────────────────────────────────────────────

export async function getAllDecks(): Promise<Deck[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Deck>('SELECT * FROM decks ORDER BY created_at DESC');
  return rows.map(mapDeck);
}

export async function getDeckById(id: string): Promise<Deck | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Deck>('SELECT * FROM decks WHERE id = ?', [id]);
  return row ? mapDeck(row) : null;
}

export async function getDeckBySourceId(sourceId: string): Promise<Deck | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Deck>(
    'SELECT * FROM decks WHERE source_id = ?',
    [sourceId]
  );
  return row ? mapDeck(row) : null;
}

export async function createDeck(data: Omit<Deck, 'id' | 'created_at' | 'updated_at'>): Promise<Deck> {
  const database = await getDatabase();
  const id = uuid();
  await database.runAsync(
    `INSERT INTO decks (id, name, description, parent_deck_id, icon, color,
      new_cards_per_day, shuffle_cards, auto_play_audio, reverse_cards,
      is_public_download, source_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.description ?? null,
      data.parent_deck_id ?? null,
      data.icon ?? null,
      data.color ?? null,
      data.new_cards_per_day,
      data.shuffle_cards ? 1 : 0,
      data.auto_play_audio ? 1 : 0,
      data.reverse_cards ? 1 : 0,
      data.is_public_download ? 1 : 0,
      data.source_id ?? null,
    ]
  );
  const deck = await getDeckById(id);
  return deck!;
}

export async function updateDeck(id: string, data: Partial<Omit<Deck, 'id' | 'created_at'>>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description ?? null); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon ?? null); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color ?? null); }
  if (data.new_cards_per_day !== undefined) { fields.push('new_cards_per_day = ?'); values.push(data.new_cards_per_day); }
  if (data.shuffle_cards !== undefined) { fields.push('shuffle_cards = ?'); values.push(data.shuffle_cards ? 1 : 0); }
  if (data.auto_play_audio !== undefined) { fields.push('auto_play_audio = ?'); values.push(data.auto_play_audio ? 1 : 0); }
  if (data.reverse_cards !== undefined) { fields.push('reverse_cards = ?'); values.push(data.reverse_cards ? 1 : 0); }

  if (fields.length === 0) return;

  fields.push('updated_at = datetime(\'now\')');
  values.push(id);

  await database.runAsync(`UPDATE decks SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteDeck(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM decks WHERE id = ?', [id]);
}

export async function resetDeckProgress(deckId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE cards SET
      status = 'new', ease_factor = 2.5, interval = 0,
      repetitions = 0, due_date = NULL, last_reviewed = NULL,
      updated_at = datetime('now')
     WHERE deck_id = ?`,
    [deckId]
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function getCardsByDeckId(deckId: string): Promise<Card[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Card>(
    'SELECT * FROM cards WHERE deck_id = ? ORDER BY created_at ASC',
    [deckId]
  );
  return rows.map(mapCard);
}

export async function getCardById(id: string): Promise<Card | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Card>('SELECT * FROM cards WHERE id = ?', [id]);
  return row ? mapCard(row) : null;
}

export async function createCard(data: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<Card> {
  const database = await getDatabase();
  const id = uuid();
  await database.runAsync(
    `INSERT INTO cards (id, deck_id, front, back, front_image, back_image, audio_url, tags,
      status, ease_factor, interval, repetitions, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.deck_id,
      data.front,
      data.back,
      data.front_image ?? null,
      data.back_image ?? null,
      data.audio_url ?? null,
      data.tags ?? null,
      data.status,
      data.ease_factor,
      data.interval,
      data.repetitions,
      data.due_date ?? null,
    ]
  );
  const card = await getCardById(id);
  return card!;
}

export async function updateCard(id: string, data: Partial<Omit<Card, 'id' | 'created_at'>>): Promise<void> {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.front !== undefined) { fields.push('front = ?'); values.push(data.front); }
  if (data.back !== undefined) { fields.push('back = ?'); values.push(data.back); }
  if (data.front_image !== undefined) { fields.push('front_image = ?'); values.push(data.front_image ?? null); }
  if (data.back_image !== undefined) { fields.push('back_image = ?'); values.push(data.back_image ?? null); }
  if (data.audio_url !== undefined) { fields.push('audio_url = ?'); values.push(data.audio_url ?? null); }
  if (data.tags !== undefined) { fields.push('tags = ?'); values.push(data.tags ?? null); }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
  if (data.ease_factor !== undefined) { fields.push('ease_factor = ?'); values.push(data.ease_factor); }
  if (data.interval !== undefined) { fields.push('interval = ?'); values.push(data.interval); }
  if (data.repetitions !== undefined) { fields.push('repetitions = ?'); values.push(data.repetitions); }
  if (data.due_date !== undefined) { fields.push('due_date = ?'); values.push(data.due_date ?? null); }
  if (data.last_reviewed !== undefined) { fields.push('last_reviewed = ?'); values.push(data.last_reviewed ?? null); }

  if (fields.length === 0) return;

  fields.push('updated_at = datetime(\'now\')');
  values.push(id);

  await database.runAsync(`UPDATE cards SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteCard(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM cards WHERE id = ?', [id]);
}

export async function getDueCards(deckId: string, limit?: number): Promise<Card[]> {
  const database = await getDatabase();
  const limitClause = limit ? `LIMIT ${limit}` : '';
  const rows = await database.getAllAsync<Card>(
    `SELECT * FROM cards
     WHERE deck_id = ?
       AND (status = 'new' OR due_date IS NULL OR due_date <= datetime('now'))
     ORDER BY
       CASE status WHEN 'new' THEN 1 WHEN 'learning' THEN 0 WHEN 'review' THEN 2 ELSE 3 END,
       due_date ASC
     ${limitClause}`,
    [deckId]
  );
  return rows.map(mapCard);
}

export async function getDeckStats(deckId: string) {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ status: string; count: number }>(
    `SELECT status, COUNT(*) as count FROM cards WHERE deck_id = ? GROUP BY status`,
    [deckId]
  );
  const stats = { total: 0, notStudied: 0, learning: 0, mastered: 0, dueToday: 0 };
  for (const row of rows) {
    stats.total += row.count;
    if (row.status === 'new') stats.notStudied += row.count;
    else if (row.status === 'learning' || row.status === 'review') stats.learning += row.count;
    else if (row.status === 'mastered') stats.mastered += row.count;
  }
  const dueRows = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM cards
     WHERE deck_id = ? AND (status = 'new' OR due_date IS NULL OR due_date <= datetime('now'))`,
    [deckId]
  );
  stats.dueToday = dueRows?.count ?? 0;
  return stats;
}

// ─── Study Sessions ────────────────────────────────────────────────────────────

export async function createStudySession(deckId: string): Promise<StudySession> {
  const database = await getDatabase();
  const id = uuid();
  await database.runAsync(
    'INSERT INTO study_sessions (id, deck_id) VALUES (?, ?)',
    [id, deckId]
  );
  const session = await database.getFirstAsync<StudySession>(
    'SELECT * FROM study_sessions WHERE id = ?', [id]
  );
  return session!;
}

export async function completeStudySession(
  id: string,
  data: { cards_studied: number; cards_correct: number; duration_seconds: number }
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE study_sessions
     SET cards_studied = ?, cards_correct = ?, duration_seconds = ?,
         completed_at = datetime('now')
     WHERE id = ?`,
    [data.cards_studied, data.cards_correct, data.duration_seconds, id]
  );
}

// ─── Streaks ───────────────────────────────────────────────────────────────────

export async function recordStudyActivity(cardsStudied: number): Promise<void> {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const id = uuid();
  await database.runAsync(
    `INSERT INTO streaks (id, date, cards_studied)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET cards_studied = cards_studied + ?`,
    [id, today, cardsStudied, cardsStudied]
  );
}

export async function getStreakData(): Promise<{ currentStreak: number; longestStreak: number; weekDays: StreakDay[] }> {
  const database = await getDatabase();

  // Get the last 7 days
  const rows = await database.getAllAsync<StreakDay>(
    `SELECT * FROM streaks
     WHERE date >= date('now', '-6 days')
     ORDER BY date ASC`
  );

  // Calculate current streak
  const allRows = await database.getAllAsync<StreakDay>(
    'SELECT * FROM streaks ORDER BY date DESC'
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Grace period: if the user hasn't studied yet today but studied yesterday,
  // keep the streak alive (start counting from yesterday instead of today).
  const mostRecent = allRows[0]?.date;
  const offset = mostRecent === todayStr ? 0 : mostRecent === yesterdayStr ? 1 : null;

  if (offset !== null) {
    for (let i = 0; i < allRows.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - (offset + i));
      const expectedStr = expectedDate.toISOString().split('T')[0];

      if (allRows[i]?.date === expectedStr) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let prevDate: Date | null = null;
  for (const row of [...allRows].reverse()) {
    const rowDate = new Date(row.date);
    if (prevDate) {
      const diff = (rowDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = rowDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Build 7-day week array
  const weekDays: StreakDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const existing = rows.find((r) => r.date === dateStr);
    weekDays.push(existing ?? { id: '', date: dateStr, cards_studied: 0 });
  }

  return { currentStreak, longestStreak, weekDays };
}

// ─── Bulk insert (for public deck download) ────────────────────────────────────

export async function bulkInsertCards(cards: Omit<Card, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    for (const card of cards) {
      const id = uuid();
      await database.runAsync(
        `INSERT INTO cards (id, deck_id, front, back, front_image, back_image, audio_url, tags,
          status, ease_factor, interval, repetitions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', 2.5, 0, 0)`,
        [
          id,
          card.deck_id,
          card.front,
          card.back,
          card.front_image ?? null,
          card.back_image ?? null,
          card.audio_url ?? null,
          card.tags ?? null,
        ]
      );
    }
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mapDeck(row: any): Deck {
  return {
    ...row,
    shuffle_cards: Boolean(row.shuffle_cards),
    auto_play_audio: Boolean(row.auto_play_audio),
    reverse_cards: Boolean(row.reverse_cards),
    is_public_download: Boolean(row.is_public_download),
  };
}

function mapCard(row: any): Card {
  return {
    ...row,
    status: (row.status as CardStatus) ?? 'new',
  };
}
