import * as http from "http";
import * as express from "express";
import { Response, Request, NextFunction } from "express";

// middleware
const cors = require("cors");
const bodyParser = require("body-parser");

import { init as initServices } from "./services";

const PORT = 4321;
const APP = express();

APP.use(cors());
APP.use(bodyParser.json());
APP.use(bodyParser.urlencoded({ extended: false }));

APP.use((req: Request, res, next: NextFunction) => {
	console.info(`start handling request ${ req.method } ${ req.path }`);
	next();
});

APP.use(express.static("../../../webclient"));
initServices(APP);

// catch 404
APP.use((req, res: Response) => {
	res.status(404).send({ status: 404, error: "Not found" });
});
// catch errors
APP.use((err, req, res: Response, next) => {
	res.status(500).send({ status: 500, error: err.message || "Server error" });
});

// start server
const server = http.createServer(APP);
server.listen(PORT);
server.on("error", error => {
	if ((error as any).syscall !== "listen") {
		throw error;
	}

	// handle specific listen errors with friendly messages
	switch ((error as any).code) {
		case "EACCES":
			console.error(`${ PORT } requires elevated privileges`);
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(`${ PORT } is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
});
server.on("listening", () => {
	const addr = server.address();
	console.debug(`Listening on ${ addr.port }`);
});