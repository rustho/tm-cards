import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;
const SHEET_RANGE = "A1:P200";

let _cachedData: any[] | null = null;
let _lastFetched = 0;
const CACHE_TTL = 1000 * 60 * 5;

export async function getCachedSheetData() {
  const now = Date.now();

  if (_cachedData && now - _lastFetched < CACHE_TTL) {
    return _cachedData;
  }

  const data = await readSheetData();

  _cachedData = data;
  _lastFetched = now;

  return data;
}

async function readSheetData() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_RANGE,
  });

  const [header, ...rows] = response.data.values || [];

  return rows.map(mapRowToUser);
}

function parseArrayString(value: string): string[] {
  try {
    return JSON.parse(value);
  } catch {
    return value.split(",").map((v) => v.trim());
  }
}

function mapRowToUser(row: string[]) {
  return {
    id: row[0],
    username: row[1],
    name: row[2],
    goal: row[3],
    gender: row[4],
    country: row[5],
    region: row[6],
    interests: row[7] ? parseArrayString(row[7]) : [],
    similarInterests: row[8],
    announcement: row[9],
    profile: row[10],
    placesToVisit: row[11],
    instagram: row[12],
    skip: Number(row[13]),
    previousMatch: row[14] ? JSON.parse(row[14]) : [],
    nextMatch: row[15],
  };
}
