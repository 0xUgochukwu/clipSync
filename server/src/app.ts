import express from "express";
import logger from "morgan";
import http from "http";
import { Server } from "socket.io";

import { errorHandler, errorNotFoundHandler } from "./middlewares/errorHandler";
import { onError } from "./utils/serverErrorHandler";
import * as config from "./config/index";

import { Socket } from "./services/session.service";

const app = express();

// SocketIO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
Socket(io);

// Express config
app.use(logger("dev"));
app.use(express.json());

// Routes
import { index } from "./routes/index";

app.use("/", index);

app.use(errorNotFoundHandler);
app.use(errorHandler);


server.listen(config.PORT || 5000, () => {
    const addr = server.address();
    const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr!.port}`;
    console.log(`Listening on ${bind}`);
});
server.on("error", onError);

