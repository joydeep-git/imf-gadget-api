import { NextFunction, Request, Response } from "express";
import { errRes } from "../utils/helperFunctions";
import { GadgetDataType, StatusCode } from "../types";
import gadgetModel from "../models/gadgetModel";
import { DatabaseError } from "pg";
import postgreErrorHandler from "../errorHandlers/postgreErrorHandler";




const gadgetValidator = async (req: Request, res: Response, next: NextFunction) => {


  // ##### get GADGET ID 
  const { gadgetId } = req.params;



  // ##### if GADGET ID missing
  if (!gadgetId) {
    return next(errRes("Provide gadget ID", StatusCode.BAD_REQUEST));
  }



  try {

    // get GADGET DETAILS
    const gadget: GadgetDataType = await gadgetModel.getGadgetDetails({ userId: req.user.id, gadgetId: gadgetId });


    // #####  if DATA NOT FOUND
    if (!gadget) {
      return next(errRes("Gadget doesn't exist!", StatusCode.NOT_FOUND));
    }


    // #### VALIDATION CHECK - if current user is the owner

    if (gadget.created_by !== req.user.id) {
      return next(errRes("You are not authorized to change the status!", StatusCode.UNAUTHORIZED));
    }


    // check if gadget is Decommissioned
    if (gadget.status === "Decommissioned") {
      return next(errRes(`This Gadget Decommissioned At : ${gadget.decommission_at}`, StatusCode.BAD_REQUEST));
    }



    // ##### when gadget has decommisioned but status hasnot changed // EDGE CASE

    // convert gadget decommision time to miliseconds and compare with current date milisecond
    if ( gadget.decommission_at && new Date(gadget.decommission_at.toString().replace(" ", "T") + "Z").getTime() < Date.now()) {

      const data = await gadgetModel.updateGadget({ gadgetId: gadget.id, status: "Decommissioned" });

      return next(errRes("Gadget is Decommissioned!", StatusCode.BAD_REQUEST));

    }



    // #### CHECK if gadget is destroyed
    if (gadget.status === "Destroyed") {
      return next(errRes(`This Gadget is Destroyed`, StatusCode.BAD_REQUEST));
    }


    // ##### when all clear
    req.gadget = gadget;


    // lets goooooooo!
    next();


  } catch (err) {

    return next(
      err instanceof DatabaseError
        ? postgreErrorHandler(err)
        : errRes("Gadget Middleware fetch gadget issue!", StatusCode.INTERNAL_SERVER_ERROR)
    )

  }

};

export default gadgetValidator;