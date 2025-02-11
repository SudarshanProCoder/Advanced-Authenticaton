import crypto from "crypto";

export const hashToken = (token) => {
  //hash token using sha256
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};
