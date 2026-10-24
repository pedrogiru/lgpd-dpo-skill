import { Router } from "express";
import { autenticado } from "../auth";
import { excluirContaCompleta } from "../services/exclusao-conta";

export const contaRouter = Router();

// "Excluir minha conta" no app (Configurações > Privacidade). Atende ao pedido de eliminação do titular.
contaRouter.delete("/conta", autenticado, async (req, res) => {
  const saldo = await req.db.contas.saldo(req.usuario!.id);
  if (saldo !== 0) return res.status(409).json({ erro: "Transfira o saldo antes de encerrar a conta." });

  await excluirContaCompleta(req.db, req.s3, req.usuario!.id);
  res.status(204).end();
});
