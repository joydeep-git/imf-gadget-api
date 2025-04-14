

// third party
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { Application } from "express";
import errorMiddleware from "./middleware/errorMiddleware";
import authRouter from "./routers/authRouters";
import gadgetRouter from "./routers/gadgetRouters";


// importing just postgre class to run its constructor
import "./config/postgre";



class Server {

	private app: Application;

	private port: number;


	constructor() {

		dotenv.config();

		this.app = express();

		this.port = parseInt(process.env.PORT as string, 10) || 5348;

		this.runServer();

	}



	// ###########  running all methods

	private runServer() {

    try {

			this.middlewareConfig();

			this.createRoutes();

			this.errorMiddlewareConfig();

			this.startServer();

		} catch (err) {

			console.error("failed to start server :", err);
			process.exit(1);

		}

	}



	// ############# call middlewares for request body parser, cookies
	private middlewareConfig() {
		this.app.use(express.json());
		this.app.use(cookieParser());
	}



	// ###########  project base routes
	private createRoutes() {

		this.app.use("/api/user", authRouter);

		this.app.use("/api/gadget", gadgetRouter );

	}


	// ########## error middleware
	private errorMiddlewareConfig() {
		this.app.use(errorMiddleware);
	}



	// ######## start server on port
	private startServer() {

		this.app.listen(this.port, () => {
			console.log("Sever is LIVE on: ", this.port);
		});
	}

}

new Server();
