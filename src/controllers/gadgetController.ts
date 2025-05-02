import { NextFunction, Request, Response } from "express";
import gadgetModel from "../models/gadgetModel";
import { GadgetDataType, StatusCode } from "../types";
import { errRes, isValidStatus } from "../utils/helperFunctions";
import { DatabaseError } from "pg";
import postgreErrorHandler from "../errorHandlers/postgreErrorHandler";




class GadgetController {


  public async createGadget(req: Request, res: Response, next: NextFunction): Promise<void> {

    // getting gadget name from user
    const { name } = req.body;


    // ##### IF data not present
    if (!name) return next(errRes("Provide Gadget NAME", StatusCode.BAD_REQUEST));


    // ###### CREATE new gadget
    try {
      const newGadget = await gadgetModel.createNewGadget({ name, userId: req.user.id });

      res.status(200).json({
        message: "Created!",
        success: true,
        data: newGadget
      });
    } catch (err) {
      return next((err instanceof DatabaseError) ? postgreErrorHandler(err) : errRes("Error Creating gadget", StatusCode.BAD_REQUEST));
    }

  }


  public async getGadgets(req: Request, res: Response, next: NextFunction): Promise<void> {


    // will get gadget id or queries
    const { gadgetId } = req.params;


    // getting the queries
    const { name, status }: { name?: string; status?: string; } = req.query;


    // step by step checking, if gadgetId then what, if queries then and when no other details

    try {

      if (gadgetId) { // when gadgetId present

        const singleGadget: GadgetDataType = await gadgetModel.getGadgetDetails({ userId: req.user.id, gadgetId });

        if (!singleGadget) { // #### if not gadget found

          return next(errRes("No gadget found!", StatusCode.BAD_REQUEST));

        } else { // if found send details

          res.status(StatusCode.OK).json({
            message: "Gadget details fetched!",
            success: true,
            data: singleGadget,
          });

        }

      } else if (name || status) {

        let stat: string = "";

        if (status) {


          // MAKE FIRST ALPHABET CAPITAL
          stat = status.substring(0, 1).toUpperCase() + status.substring(1, status.length).toLowerCase();


          // #### CHECK if status is valid
          if (!isValidStatus(stat)) {
            return next(errRes("Invalid Status, please enter a valid status!", StatusCode.BAD_REQUEST));
          }

        }


        const data: GadgetDataType[] = await gadgetModel.getGadgetDetails({ name, status: stat, userId: req.user.id });

        res.status(StatusCode.OK).json({
          success: true,
          message: `Fetched gadgets`,
          data
        });


      } else {

        const allGadgets: GadgetDataType[] = await gadgetModel.getGadgetDetails({ userId: req.user.id });

        res.status(StatusCode.OK).json({
          message: "All Gadgets fetched!",
          success: true,
          data: allGadgets,
        });

      }


    } catch (err) {
      return err instanceof DatabaseError
        ? next(postgreErrorHandler(err))
        : next(
          errRes("Error fetching gadgets!", StatusCode.INTERNAL_SERVER_ERROR)
        );
    }

  }



  public async selfDestruct(req: Request, res: Response, next: NextFunction) {

    try {

      const data = await gadgetModel.changeStatus({ gadgetId: req.gadget.id, status: "Destroyed" });

      res.status(StatusCode.OK).json({
        success: true,
        message: `${data.name} Destroyed!`,
        data
      })

    } catch (err) {

      return next(err instanceof DatabaseError ? postgreErrorHandler(err) : errRes("Error in Self Destruct!", StatusCode.INTERNAL_SERVER_ERROR))

    }

  }



  public async updateGadget(req: Request, res: Response, next: NextFunction): Promise<void> {

    const { name, action } = req.params;


    // validate action

    if (action && (action.toLowerCase() !== "deploy" || "withdraw")) {
      return next(errRes("Wrong Action! Only 'Deploy' & 'Withdraw' is accepted.", StatusCode.BAD_REQUEST));
    }


    try {

      const data = await gadgetModel.updateGadget({ gadgetId: req.gadget.id, name, status: action });

      res.status(StatusCode.OK).json({
        success: true,
        message: "Gadget Updated Successfully!",
        data
      });

    } catch (err) {
      return next(
        
        err instanceof DatabaseError
          ? postgreErrorHandler(err)
          : errRes("Error in Gadget Update!", StatusCode.INTERNAL_SERVER_ERROR)

      )
    }



  }


  public async deleteGadget(req: Request, res: Response, next: NextFunction): Promise<void> {


    try {

      const data = await gadgetModel.changeStatus({ gadgetId: req.gadget.id, status: "Decommissioned", updateDecommission: true });

      res.status(StatusCode.OK).json({
        success: true,
        message: `${data.name} ${data.status} Successfully! You no longer can use it!`,
        data
      });

    } catch (err) {

      return next(
        err instanceof DatabaseError
          ? postgreErrorHandler(err)
          : errRes("Error deleting gadget!", StatusCode.INTERNAL_SERVER_ERROR)
      )

    }

  }


}

const gadgetController: GadgetController = new GadgetController();

export default gadgetController;