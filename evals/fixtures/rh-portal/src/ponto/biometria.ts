import { Router } from "express";
import { autenticado, exigirPapel } from "../auth/permissoes";

export const biometriaRouter = Router();

// Base legal: execução do contrato de trabalho (art. 7º, V, LGPD).
// O relógio de ponto envia o template da digital no cadastro; a verificação 1:1 acontece no relógio.

biometriaRouter.post("/ponto/biometria", exigirPapel("rh"), async (req, res) => {
  const { colaboradorId, templateBase64 } = req.body;
  await req.db.query(
    "INSERT INTO ponto_biometria (colaborador_id, template_digital) VALUES ($1, decode($2, 'base64')) " +
      "ON CONFLICT (colaborador_id) DO UPDATE SET template_digital = EXCLUDED.template_digital",
    [colaboradorId, templateBase64],
  );
  res.status(204).end();
});

// Usado pela sincronização dos relógios e pela tela de suporte do RH.
biometriaRouter.get("/ponto/biometria/:colaboradorId", autenticado, async (req, res) => {
  const { rows } = await req.db.query(
    "SELECT colaborador_id, encode(template_digital, 'base64') AS template FROM ponto_biometria WHERE colaborador_id = $1",
    [req.params.colaboradorId],
  );
  if (!rows[0]) return res.status(404).end();
  res.json(rows[0]);
});

biometriaRouter.post("/ponto/marcacoes", autenticado, async (req, res) => {
  await req.db.marcacoes.create({ colaboradorId: req.body.colaboradorId, marcadoEm: req.body.marcadoEm, relogioId: req.body.relogioId });
  res.status(201).end();
});
