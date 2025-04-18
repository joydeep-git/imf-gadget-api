import express, { Router } from "express";
import authController from "../controllers/authControllers";
import tokenValidator from "../middleware/tokenValidatorMiddleware";


class AuthRouter {

  public router: Router = express.Router();

  constructor() {


    this.router.post("/login", authController.signIn);


    this.router.post("/register", authController.signUp);


    this.router.delete("/logout/:id", tokenValidator, authController.signOut);


    this.router.patch("/update/:id", tokenValidator, authController.updateUser);


    this.router.delete("/delete/:id", tokenValidator, authController.deleteUser);

  }

}

const authRouter = new AuthRouter();

export default authRouter.router;