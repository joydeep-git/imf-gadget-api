import express, { Router } from "express";
import tokenValidator from "../middleware/tokenValidatorMiddleware";
import gadgetController from "../controllers/gadgetController";
import gadgetValidator from "../middleware/gadgetValidator";



class GadgetRouter {

  public router: Router = express.Router();


  constructor() {

    this.router.post("/:id/create", tokenValidator, gadgetController.createGadget);


    this.router.get("/:id/get/:gadgetId?", tokenValidator, gadgetController.getGadgets);


    this.router.post("/:id/self-destruct/:gadgetId", tokenValidator, gadgetValidator, gadgetController.selfDestruct);


    this.router.patch("/:id/update/:gadgetId", tokenValidator, gadgetValidator, gadgetController.updateGadget);


    this.router.delete("/:id/delete/:gadgetId", tokenValidator, gadgetValidator, gadgetController.deleteGadget);


  }

}

const gadgetRouter = new GadgetRouter();

export default gadgetRouter.router;