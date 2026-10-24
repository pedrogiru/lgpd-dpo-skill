import { createHash } from "node:crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_TOKEN;

const sha256 = (valor: string) => createHash("sha256").update(valor.trim().toLowerCase()).digest("hex");

type Compra = {
  email: string;
  telefone: string;
  valor: number;
  pedidoId: string;
  fbp?: string;
  ip?: string;
  userAgent?: string;
};

/** Envia o evento Purchase para a API de Conversões da Meta (otimização de campanhas). */
export async function enviarCompraMeta(compra: Compra) {
  const evento = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_id: compra.pedidoId,
    user_data: {
      em: [sha256(compra.email)],
      ph: [sha256(compra.telefone.replace(/\D/g, ""))],
      fbp: compra.fbp,
      client_ip_address: compra.ip,
      client_user_agent: compra.userAgent,
    },
    custom_data: { currency: "BRL", value: compra.valor },
  };

  await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [evento], access_token: TOKEN }),
  });
}
