import { NextFunction, Request, Response } from "express";
import { errRes, isValidEmail } from "../utils/helperFunctions";
import { BlacklistedTokenType, StatusCode, UserDataType } from "../types";
import authModel from "../models/authModel";
import bcrypt from "bcryptjs";
import { DatabaseError } from "pg";
import postgreErrorHandler from "../errorHandlers/postgreErrorHandler";
import jwt from "jsonwebtoken";
import blackListedToken from "../models/blacklistedToken";



class AuthController {


  // ######### SIGN UP / CREATE NEW USER
  public async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { name, email, password } = req.body;


    // #### check if user sending data
    if (!name || !email || !password) {

      return next(errRes("Please enter Name, Email and Password!", StatusCode.BAD_REQUEST));

    }



    // #### check if user exists and show error
    const user = await authModel.findUserByEmail(email);

    if (user) {

      return next(errRes("User already exists!", StatusCode.CONFLICT));

    }



    // #### CHECK if email is valid
    if (!isValidEmail(email)) {

      return next(errRes("Invalid Email!", StatusCode.BAD_REQUEST));

    }



    try {

      // #### CREATE user
      const hashedPassword = bcrypt.hashSync(password, 10);

      const newUser: UserDataType = await authModel.createNewUser({ name, email: email.toLowerCase(), hashedPassword });

      // #### create token // token expiry 1 day
      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET_KEY!, { expiresIn: "1d" } );


      // #### SET cookie and SEND response back to user
      res.cookie("token", token).status(StatusCode.CREATED).json({
        message: "Account created  successfully!",
        data: newUser,
      });

    } catch (err) {

      if (err instanceof DatabaseError) {
        postgreErrorHandler(err);
      } else {
        return next(errRes("Error on creating new user!", StatusCode.INTERNAL_SERVER_ERROR));
      }

    }


  }




  // ######### SIGN IN USER

  public async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { email, password } = req.body;

    // #### check if data is present
    if (!email || !password) {

      return next(errRes("Email or Password missing! ", StatusCode.BAD_REQUEST));

    }


    // #### check if User exists
    const user = await authModel.findUserByEmail(email, true);

    if (!user) return next(errRes("No User found!", StatusCode.UNAUTHORIZED));


    // #### CHECK password
    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {

      return next(errRes("Invalid Password!", StatusCode.UNAUTHORIZED));

    } else {

      try {
        // ##### generate token // token expiry 1 day
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY!, { expiresIn: "1d" } );


        // #### Remove password from user data
        user.password = "*****";


        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        res.status(StatusCode.OK).json({
          message: "Logged In successfully!",
          success: true,
          data: user
        });

      } catch (err) {

        return next(errRes("Error generating token!", StatusCode.INTERNAL_SERVER_ERROR));

      }

    }

  }




  // ######### SIGN OUT USER / REMOVE TOKEN 
  public async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {

    const token: string = req.cookies.token || req.headers.authorization?.split(" ")[1];



    try {

      await blackListedToken.blacklistToken(token);

    } catch (err) {

      if (err instanceof DatabaseError) {

        postgreErrorHandler(err);

      } else {

        return next(errRes("Sign Out failed!", StatusCode.BAD_REQUEST));

      }
    }

    res.clearCookie("token", {
      expires: new Date()
    });

    res.status(StatusCode.OK).json({ success: true, message: "User Logged out!" });

  }





  // UPDATE EXISTING USER
  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { name, email, password } = req.body;


    // ##### if any of the data exists or show error
    if (name || email || password) {


      // ##### valid email
      if (email && !isValidEmail(email)) {
        return next(errRes("Please enter a valid Email!", StatusCode.BAD_REQUEST));
      }

      try {

        // hash password
        let hashedPassword: string | undefined = password ? bcrypt.hashSync(password, 10) : undefined;

        const updatedUser: UserDataType = await authModel.updateUser({
          userId: req.user.id,
          name, email, hashedPassword
        });

        res.status(StatusCode.OK).json({ message: "User updated!", success: true, data: updatedUser });

      } catch (err) {

        if (err instanceof DatabaseError) {
          postgreErrorHandler(err);
        } else {
          return next(errRes("Updating User data failed!", StatusCode.INTERNAL_SERVER_ERROR));
        }

      }


    } else {

      return next(errRes("No data", StatusCode.BAD_REQUEST));

    }

  }



  // DELETE USER ACCOUNT
  public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {

    try {
      
      const deletedUser: UserDataType = await authModel.deleteUser(req.user.id);


      if (!deletedUser) return next(errRes("Unable to delete User!", StatusCode.BAD_REQUEST));

      res.status(StatusCode.OK).json({
        success: true,
        message: "User Account DELETED!",
        data: deletedUser
      });

    } catch (err) {
      return next(errRes("Updating User failed!", StatusCode.INTERNAL_SERVER_ERROR));
    }

  }

}

const authController: AuthController = new AuthController();

export default authController;