import { Router } from "express";
import multer from "multer";
import { exigirPapel } from "../auth/permissoes";

export const candidaturasRouter = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Página pública "Trabalhe conosco".
candidaturasRouter.post("/vagas/:vagaId/candidaturas", upload.single("curriculo"), async (req, res) => {
  const curriculoUrl = await req.storage.put("curriculos", req.file!);
  const c = await req.db.candidaturas.create({
    vagaId: req.params.vagaId,
    nome: req.body.nome,
    email: req.body.email,
    telefone: req.body.telefone,
    pretensao: req.body.pretensao ? Number(req.body.pretensao) : null,
    curriculoUrl,
  });
  res.status(201).json({ protocolo: c.id });
});

candidaturasRouter.patch("/rh/candidaturas/:id/status", exigirPapel("rh"), async (req, res) => {
  await req.db.candidaturas.atualizarStatus(req.params.id, req.body.status);
  res.status(204).end();
});

// Banco de talentos: o RH pesquisa candidaturas antigas quando abre vaga parecida.
candidaturasRouter.get("/rh/banco-de-talentos", exigirPapel("rh"), async (req, res) => {
  res.json(await req.db.candidaturas.buscar({ termo: String(req.query.q ?? "") }));
});
