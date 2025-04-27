import postgres from "../config/postgre";
import { BlacklistedTokenType } from "../types";


class BlacklistedToken {


  // #### inset a token's value in blacklisted token table // if token is already there dont do anything
  public async blacklistToken(token: string): Promise<void> {
    await postgres.db.query("INSERT INTO blacklisted_tokens ( token ) VALUES ($1) ON CONFLICT ( token ) DO NOTHING", [token]);
  }


  // ##### see if current token is in this table
  public async getBlacklistedToken(token: string): Promise<BlacklistedTokenType> {
    return (await postgres.db.query("SELECT * FROM blacklisted_tokens WHERE token = $1", [token])).rows[0];
  }

}

const blackListedToken: BlacklistedToken = new BlacklistedToken();

export default blackListedToken;