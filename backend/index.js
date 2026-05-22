import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "https://meet.google.com"], // frontend URL
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const server = createServer(app);

import uploadChunkRouter from "./routes/upload-chunk.route.js";

app.use("/data", uploadChunkRouter);

import queryRouter from "./routes/query.route.js";

app.use("/chat-query", queryRouter);

import userRouter from "./routes/user.route.js";

app.use("/user", userRouter);

server.listen(4000, () => {
    console.log("Server started on port 3000");
});