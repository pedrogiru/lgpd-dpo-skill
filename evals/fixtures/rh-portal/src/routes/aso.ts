import { Router } from "express";
import { exigirPapel, daEquipe } from "../auth/permissoes";

export const asoRouter = Router();

// Gestor: só precisa saber se o colaborador está apto para a função e até quando.
asoRouter.get("/gestor/equipe/:colaboradorId/aso", exigirPapel("gestor"), daEquipe, async (req, res) => {
  const aso = await req.db.aso.ultimoPorColaborador(req.params.colaboradorId);
  if (!aso) return res.status(404).end();
  res.json({ tipo: aso.tipo, resultado: aso.resultado, validoAte: aso.valido_ate });
});

// Medicina do trabalho: ficha completa (exames, anamnese).
asoRouter.get("/medicina/aso/:asoId", exigirPapel("medico_trabalho"), async (req, res) => {
  const aso = await req.db.aso.buscar(req.params.asoId);
  if (!aso) return res.status(404).end();
  await req.db.auditoria.registrar({ usuarioId: req.usuario!.id, acao: "leitura_aso", alvo: aso.id });
  res.json(aso);
});
