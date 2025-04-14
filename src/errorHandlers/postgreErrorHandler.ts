import { DatabaseError } from "pg";
import { StatusCode } from "../types";
import ErrorHandler from "./errorHandler";


const postgreErrorHandler = (err: DatabaseError) => {

  let status: number;
  let message: string;


  switch (err.code) {

    case "23505":
      status = StatusCode.CONFLICT;
      message = "Duplicate value in a column with UNIQUE constraint";
      break;

    case "23503":
      status = StatusCode.NOT_FOUND;
      message = "Insert/update on a foreign key that doesn't exist";
      break;

    case "23502":
      status = StatusCode.BAD_REQUEST;
      message = "Inserting NULL into a NOT NULL column";
      break;

    case "23514":
      status = StatusCode.BAD_REQUEST;
      message = "Violating a CHECK constraint";
      break;

    case "42601":
      status = StatusCode.BAD_REQUEST;
      message = "SQL syntax error";
      break;

    case "42883":
      status = StatusCode.BAD_REQUEST;
      message = "Function does not exist";
      break;

    case "42703":
      status = StatusCode.BAD_REQUEST;
      message = "Column does not exist";
      break;

    case "42P01":
      status = StatusCode.NOT_FOUND;
      message = "Table does not exist";
      break;

    case "53300":
      status = StatusCode.INTERNAL_SERVER_ERROR;
      message = "Too many connections. Try again later.";
      break;

    case "22003":
      status = StatusCode.BAD_REQUEST;
      message = "Storing a number too big for the column type";
      break;

    case "22001":
      status = StatusCode.BAD_REQUEST;
      message = "Inserting string longer than column's character limit";
      break;

    default:
      status = StatusCode.INTERNAL_SERVER_ERROR;
      message = "Database Error";
      break;

  }

  return new ErrorHandler({
    status,
    message: err.message || message,
  });
};

export default postgreErrorHandler;