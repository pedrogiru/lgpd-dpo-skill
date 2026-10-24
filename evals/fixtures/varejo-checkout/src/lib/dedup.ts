import { createHmac } from "node:crypto";

// Pepper injetado pelo cofre de segredos; não fica no banco nem no repositório.
const PEPPER = process.env.DEDUP_PEPPER;
if (!PEPPER) throw new Error("DEDUP_PEPPER não configurado");

/**
 * Chave para detectar cadastro duplicado do mesmo cliente.
 * Usada só dentro do nosso banco (coluna clientes.chave_dedup); não é enviada a terceiros.
 */
export function chaveDeduplicacao(cpf: string): string {
  const normalizado = String(cpf).replace(/\D/g, "");
  return createHmac("sha256", PEPPER as string).update(normalizado).digest("hex");
}
