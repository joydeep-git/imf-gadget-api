
// ###########################
// error middleware capturing all errors and sending it to user in a structured way



import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { StatusCode } from "../types";


// config
dotenv.config();


const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {


  const statusCode = err?.statusCode || StatusCode.INTERNAL_SERVER_ERROR;

  const message = err?.message || "Internal Server Error";



  if (process.env.NODE_ENV === "production") {

    res.status(statusCode).json({
      success: false,
      statusCode,
      message
    });

  } else {

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      stack: err.stack || "No stack trace available"
    });

  }


};

export default errorMiddleware;