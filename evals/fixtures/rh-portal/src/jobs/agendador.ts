import cron from "node-cron";
import { db } from "../db";
import { expurgarFolhaVencida } from "../folha/retencao";

// Sessões expiradas do SSO: todo dia às 03:00.
cron.schedule("0 3 * * *", () => db.sessoes.apagarExpiradas());

// Guarda da folha de pagamento: todo dia 1º às 04:00.
cron.schedule("0 4 1 * *", () => expurgarFolhaVencida(db));
