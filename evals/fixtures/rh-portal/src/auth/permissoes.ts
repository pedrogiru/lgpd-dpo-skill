import type { Request, Response, NextFunction } from "express";

export type Papel = "colaborador" | "gestor" | "rh" | "medico_trabalho" | "admin";

/** Exige um token válido emitido pelo SSO corporativo. Preenche req.usuario. */
export function autenticado(req: Request, res: Response, next: NextFunction) {
  if (!req.usuario) return res.status(401).json({ erro: "não autenticado" });
  next();
}

/** Exige que o usuário autenticado tenha um dos papéis informados. */
export function exigirPapel(...papeis: Papel[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) return res.status(401).json({ erro: "não autenticado" });
    if (!papeis.includes(req.usuario.papel)) return res.status(403).json({ erro: "sem permissão" });
    next();
  };
}

/** O gestor só enxerga quem está na própria equipe. */
export async function daEquipe(req: Request, res: Response, next: NextFunction) {
  const ok = await req.db.colaboradores.ehDaEquipe(req.params.colaboradorId, req.usuario!.id);
  if (!ok) return res.status(403).json({ erro: "colaborador fora da sua equipe" });
  next();
}
