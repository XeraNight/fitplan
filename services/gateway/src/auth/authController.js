import { badRequest } from "@fitplan/shared";
import { verifyGoogleCredential } from "./googleVerifier.js";
import { signToken } from "./jwt.js";

// Login use case: Google ID token -> verified user -> our own JWT.
export function createAuthController(config, audit) {
  return {
    async loginWithGoogle(req, res) {
      const credential = req.body?.credential;
      if (!credential) throw badRequest("GOOGLE_CREDENTIAL_MISSING", "credential is required");

      const google = await verifyGoogleCredential(credential, config.googleClientId);
      const user = {
        id: google.sub,
        name: google.name,
        email: google.email,
        picture: google.picture,
      };
      const token = signToken(user, config.jwtSecret);

      audit.send("USER_LOGGED_IN", { userId: user.id, entityType: "User", entityId: user.id });
      res.json({ token, user });
    },

    me(req, res) {
      res.json({ user: req.user });
    },
  };
}
