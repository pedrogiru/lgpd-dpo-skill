import pino from "pino";

// Os arquivos de log são coletados pelo agente do serviço de observabilidade
// (retenção de 90 dias, acesso de todo o time de engenharia e do suporte N2).
export const logger = pino({ level: process.env.LOG_LEVEL ?? "info" }, pino.destination("logs/app.log"));
