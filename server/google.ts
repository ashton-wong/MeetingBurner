import { google } from "googleapis";

const { OAuth2 } = google.auth;

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT || "http://localhost:5000/api/google/callback";

export function getOAuth2Client() {
  return new OAuth2(clientId, clientSecret, redirectUri);
}

export function generateAuthUrl() {
  const oAuth2Client = getOAuth2Client();
  const scopes = [
    // Request Calendar + Drive readonly for event mapping and Drive artifacts.
    // Note: Google Workspace Meet-specific scopes (for direct Meet artifacts)
    // may require additional admin consent and different scope names. If you
    // need direct Meet API access, add appropriate Meet scopes after
    // verifying availability for your Workspace.
    "https://www.googleapis.com/auth/calendar.events.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  return url;
}

export async function getTokenFromCode(code: string) {
  const oAuth2Client = getOAuth2Client();
  const res = await oAuth2Client.getToken(code);
  return res.tokens;
}

export function clientFromTokens(tokens: any) {
  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

export default {
  generateAuthUrl,
  getTokenFromCode,
  clientFromTokens,
};
