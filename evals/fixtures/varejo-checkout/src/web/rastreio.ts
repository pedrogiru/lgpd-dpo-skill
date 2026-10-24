export async function consultarPedido(cpf: string, numero: string) {
  const url = `/api/pedidos/rastreio?cpf=${encodeURIComponent(cpf)}&pedido=${encodeURIComponent(numero)}`;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("Pedido não encontrado");
  return resposta.json();
}
