import { Router } from "express";
import multer from "multer";
import { autenticado, exigirPapel, daEquipe } from "../auth/permissoes";

export const atestadosRouter = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

// Colaborador envia o atestado (foto ou PDF) e informa o CID, se constar no documento.
atestadosRouter.post("/atestados", autenticado, upload.single("arquivo"), async (req, res) => {
  const arquivoUrl = await req.storage.put("atestados", req.file!);
  const atestado = await req.db.atestados.create({
    colaboradorId: req.usuario!.id,
    dataInicio: req.body.dataInicio,
    dias: Number(req.body.dias),
    cid: req.body.cid || null,
    arquivoUrl,
  });
  res.status(201).json({ id: atestado.id });
});

// Painel do gestor: ausências da equipe para planejar escala.
atestadosRouter.get(
  "/gestor/equipe/:colaboradorId/atestados",
  exigirPapel("gestor"),
  daEquipe,
  async (req, res) => {
    const atestados = await req.db.atestados.listarPorColaborador(req.params.colaboradorId);
    res.json(
      atestados.map((a) => ({
        id: a.id,
        dataInicio: a.data_inicio,
        dias: a.dias,
        cid: a.cid,
      })),
    );
  },
);
