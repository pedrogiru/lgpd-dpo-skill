import { Router } from "express";
import { autenticado } from "../auth";

export const onboardingRouter = Router();

// Etapa 2 do cadastro: documento com foto + selfie + dados de renda (exigência de PLD/FT).
onboardingRouter.post("/onboarding/kyc", autenticado, async (req, res) => {
  const clienteId = req.usuario!.id;
  const { documentos, rendaMensal, ocupacao, pep } = req.body; // documentos: [{ tipo, base64 }]

  for (const doc of documentos) {
    const key = `kyc/${clienteId}/${doc.tipo}-${Date.now()}.jpg`;
    await req.s3.putObject({ Bucket: process.env.KYC_BUCKET!, Key: key, Body: Buffer.from(doc.base64, "base64") });
    await req.db.kycDocumentos.create({ clienteId, tipo: doc.tipo, s3Key: key });
  }

  const avaliacao = await req.motorRisco.avaliar({ clienteId, rendaMensal, ocupacao, pep });
  await req.db.kycVerificacoes.create({
    clienteId,
    rendaMensal,
    ocupacao,
    pep: Boolean(pep),
    scoreRisco: avaliacao.score,
    resultado: avaliacao.resultado,
  });

  res.status(201).json({ resultado: avaliacao.resultado });
});
