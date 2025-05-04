import { NextFunction, Request, Response } from "express";
import { errRes, errRouter, isValidEmail } from "../utils/helperFunctions";
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

      // #### SET cookie and SEND response back to user
      res.status(StatusCode.CREATED).json({
        message: "Account created  successfully!",
        data: newUser,
      });

    } catch (err) {

      return next(errRouter(err, "Error on creating new user!"));

    }


  }



  // ######## GET user details
  public getDetails(req: Request, res: Response, next: NextFunction) {

    try {

      res.status(StatusCode.OK).json({
        success: true,
        message: "User data fetched!",
        data: req.user
      });

    } catch (err) {
      return next(errRouter(err, "Error on fetching User data!"));
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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY!, { expiresIn: "1d" });


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

        return next(errRouter(err, "Error generating token!"));

      }

    }

  }




  // ######### SIGN OUT USER / REMOVE TOKEN 
  public async signOut(req: Request, res: Response, next: NextFunction): Promise<void> {

    const token: string = req.cookies.token || req.headers.authorization?.split(" ")[1];


    try {

      await blackListedToken.blacklistToken(token);

      res.clearCookie("token", {
        expires: new Date()
      });

      res.status(StatusCode.OK).json({ success: true, message: "User Logged out!" });

    } catch (err) {

      return next(errRouter(err, "Sign Out failed!"));

    }

  }





  // UPDATE EXISTING USER
  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { name, email, password } = req.body;


    // CHECKS if values are same to existing data
    if (name && req.user.name === name) {
      return next(errRes("New name and existing name are same! Enter new value.", StatusCode.BAD_REQUEST))
    }

    if (email && req.user.email === email) {
      return next(errRes("New email and existing email are same! Enter new value.", StatusCode.BAD_REQUEST))
    }



    // ##### check if new email already belongs to another user
    try {

      const getUser: UserDataType = await authModel.findUserByEmail(email);

      if (getUser && getUser.id !== req.user.id) {
        return next(errRes("Another account exists on this email! Provide another email.", StatusCode.BAD_REQUEST));
      }

    } catch (err) {
      return next(errRouter(err, "Something wrong in Update user email check!"));
    }



    // ##### if any of the data exists or show error
    if (name || email || password) {


      // ##### valid email
      if (email && !isValidEmail(email)) {
        return next(errRes("Please enter a valid Email!", StatusCode.BAD_REQUEST));
      }

      try {

        let hashedPassword: string | undefined;

        // hash password
        if (password) {
          hashedPassword = bcrypt.hashSync(String(password), 10);
        }

        const updatedUser: UserDataType = await authModel.updateUser({
          userId: req.user.id,
          name, email,
          hashedPassword
        });

        res.status(StatusCode.OK).json({ message: "User updated!", success: true, data: updatedUser });

      } catch (err) {

        return next(errRouter(err, "Updating user failed!"));

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

      return next(errRouter(err, "Delete User failed!"));

    }

  }

}

const authController: AuthController = new AuthController();

export default authController;