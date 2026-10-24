import { Router } from "express";
import { db } from "../db";

export const pedidosRouter = Router();

// "Acompanhe seu pedido" sem login: o cliente informa CPF e número do pedido.
// Ex.: GET /api/pedidos/rastreio?cpf=111.222.333-00&pedido=100234
pedidosRouter.get("/pedidos/rastreio", async (req, res) => {
  const cpf = String(req.query.cpf ?? "");
  const numero = String(req.query.pedido ?? "");

  const pedido = await db.pedidos.findByCpfENumero(cpf, numero);
  if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" });

  res.json({ numero: pedido.numero, status: pedido.status, previsaoEntrega: pedido.previsaoEntrega });
});
