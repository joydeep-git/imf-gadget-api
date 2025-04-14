
// express.d.ts file
// extending request object to insert "USER" in it

import { UserDataType } from "."

declare global {

  namespace Express {

    interface Request {

      user: UserDataType;

    }

  }

}
