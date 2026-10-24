import fs from "node:fs";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { sessao } from "./middleware/sessao";
import { checkoutRouter } from "./routes/checkout";
import { pedidosRouter } from "./routes/pedidos";

const app = express();

// Log de acesso no formato combined (método, URL completa, status, referer, user-agent).
const accessLog = fs.createWriteStream("logs/access.log", { flags: "a" });
app.use(morgan("combined", { stream: accessLog }));

app.use(express.json());
app.use(cookieParser());
app.use(sessao);

app.use("/api", checkoutRouter);
app.use("/api", pedidosRouter);

app.listen(Number(process.env.PORT ?? 3000));
