
import { StatusCode } from "../types";
import ErrorHandler from "../errorHandlers/errorHandler";


const routeErrorHandler = () => {

  throw new ErrorHandler({ message: "Wrong Route or Method call. Please enter correct Route or Method ", status: StatusCode.BAD_REQUEST });

}

export default routeErrorHandler;