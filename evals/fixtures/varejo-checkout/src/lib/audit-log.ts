import { logger } from "./logger";

/** Mantém só os 2 últimos dígitos, no padrão ***.***.***-00 */
export function mascararCpf(cpf: string): string {
  const digitos = String(cpf ?? "").replace(/\D/g, "");
  if (digitos.length !== 11) return "***.***.***-**";
  return `***.***.***-${digitos.slice(9)}`;
}

/** Trilha de auditoria de pedidos, consultada pelo time antifraude. */
export function registrarPedido(evento: { pedidoId: string; cpf: string; total: number }) {
  logger.info(
    { evento: "pedido_criado", pedidoId: evento.pedidoId, cpf: mascararCpf(evento.cpf), total: evento.total },
    "auditoria",
  );
}
