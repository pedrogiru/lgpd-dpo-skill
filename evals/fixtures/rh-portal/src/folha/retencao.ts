/**
 * Política de guarda da folha de pagamento.
 * Prazo definido pelo jurídico (obrigações trabalhistas, previdenciárias e fiscais),
 * revisado anualmente. Ref.: parecer interno JUR-2026-014.
 */
export const RETENCAO_FOLHA = {
  anosAposDesligamento: 5,
  aposPrazo: "anonimizar" as const,
};

export async function expurgarFolhaVencida(db: any, hoje = new Date()) {
  const limite = new Date(hoje);
  limite.setFullYear(limite.getFullYear() - RETENCAO_FOLHA.anosAposDesligamento);

  const ids: string[] = await db.colaboradores.desligadosAntesDe(limite);
  for (const id of ids) {
    await db.folha.anonimizarPorColaborador(id); // remove vínculo com a pessoa; mantém totais contábeis
  }
  return ids.length;
}
