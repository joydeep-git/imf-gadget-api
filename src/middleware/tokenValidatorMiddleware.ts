

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { DatabaseError } from "pg";

import { BlacklistedTokenType, StatusCode, UserDataType } from "../types";
import authModel from "../models/authModel";
import { errRes } from "../utils/helperFunctions";
import blackListedToken from "../models/blacklistedToken";
import postgreErrorHandler from "../errorHandlers/postgreErrorHandler";



const tokenValidator = async (req: Request, res: Response, next: NextFunction) => {

  // ### get user's id from params
  const { id } = req.params;


  // #### if id is not present
  if (!id) {
    return next(errRes("No ID found! Please provide USER ID", StatusCode.BAD_REQUEST));
  }



  // ##### get token
  const token: string = req.cookies.token || req.headers.authorization?.split(" ")[1];



  // #### if token isnt there
  if (!token) {
    return next(errRes("No TOKEN found!", StatusCode.UNAUTHORIZED));
  }


  let userId: string;


  try {

    // #### if token is present then get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;

    userId = decoded.userId;

    // ####### check token expiry date less than current date
    if (decoded.exp! < Math.floor(Date.now() / 1000)) {
      return next(errRes("Session Expired! Please Login again.", StatusCode.UNAUTHORIZED));
    }


    try {
      // ##### check blacklisted tokens
      const res: BlacklistedTokenType = await blackListedToken.getBlacklistedToken(token);

      // #### if token exists in blacklist send error
      if (res) {

        console.log("stop blacklist token", token);

        return next(errRes("Session Expired! Please Login again.", StatusCode.UNAUTHORIZED));
      }

    } catch (err) {

      if (err instanceof DatabaseError) {
        postgreErrorHandler(err);
      } else {
        return next(errRes("Session validation Error! Please try again", StatusCode.UNAUTHORIZED));
      }

    }

  } catch (err) {

    // #### return error if token is invalid

    return next(errRes("Invalid token!", StatusCode.UNAUTHORIZED));

  }


  // #### invalid token check
  if (!userId) {
    return next(errRes("Invalid token!", StatusCode.UNAUTHORIZED));
  }


  // #### GET user details from userId
  const val: UserDataType = await authModel.findUserById(userId);


  if (!val) {
    return next(errRes("User not found!", StatusCode.UNAUTHORIZED));
  }



  // #### compare id with userId given by user

  if (val.id !== id) {

    return next(errRes("Unauthorized access!", StatusCode.UNAUTHORIZED));

  } else {

    req.user = val;

    next();
  }

}

export default tokenValidator;
