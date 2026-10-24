import { Router } from "express";
import { logger } from "../lib/logger";
import { registrarPedido } from "../lib/audit-log";
import { chaveDeduplicacao } from "../lib/dedup";
import { enviarCompraMeta } from "../integrations/meta-capi";
import { db } from "../db";

export const checkoutRouter = Router();

// Corpo esperado:
// { nome, email, cpf, telefone, endereco: { cep, logradouro, numero, cidade, uf }, itens: [...], aceitaMarketing }
checkoutRouter.post("/checkout", async (req, res) => {
  logger.info({ body: req.body }, "checkout recebido");

  const { nome, email, cpf, telefone, endereco, itens, aceitaMarketing } = req.body;

  const chave = chaveDeduplicacao(cpf);
  const cliente =
    (await db.clientes.findByChaveDedup(chave)) ??
    (await db.clientes.create({ nome, email, cpf, telefone, chaveDedup: chave }));

  const pedido = await db.pedidos.create({
    clienteId: cliente.id,
    itens,
    endereco,
    aceitaMarketing: Boolean(aceitaMarketing),
  });

  registrarPedido({ pedidoId: pedido.id, cpf, total: pedido.total });

  await enviarCompraMeta({
    email,
    telefone,
    valor: pedido.total,
    pedidoId: pedido.id,
    fbp: req.cookies._fbp,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.status(201).json({ pedidoId: pedido.id });
});
