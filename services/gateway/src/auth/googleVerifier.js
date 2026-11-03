import { OAuth2Client } from "google-auth-library";
import { unauthorized } from "@fitplan/shared";

const client = new OAuth2Client();

// Checks the Google ID token (signature, expiry, issued for OUR client id) and returns the user.
export async function verifyGoogleCredential(credential, clientId) {
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const { sub, email, name, picture } = ticket.getPayload();
    return { sub, email, name, picture };
  } catch {
    throw unauthorized("GOOGLE_TOKEN_INVALID", "Google sign-in could not be verified");
  }
}
