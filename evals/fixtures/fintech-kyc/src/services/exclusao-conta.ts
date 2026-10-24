import type { S3Client } from "@aws-sdk/client-s3";

/**
 * Remove definitivamente todos os dados do cliente, sem possibilidade de recuperação.
 */
export async function excluirContaCompleta(db: any, s3: S3Client & any, clienteId: string) {
  const docs = await db.query("SELECT s3_key FROM kyc_documentos WHERE cliente_id = $1", [clienteId]);
  for (const { s3_key } of docs.rows) {
    await s3.deleteObject({ Bucket: process.env.KYC_BUCKET!, Key: s3_key });
  }

  await db.query("BEGIN");
  await db.query("DELETE FROM sessoes WHERE cliente_id = $1", [clienteId]);
  await db.query("DELETE FROM preferencias_marketing WHERE cliente_id = $1", [clienteId]);
  await db.query("DELETE FROM kyc_documentos WHERE cliente_id = $1", [clienteId]);
  await db.query("DELETE FROM kyc_verificacoes WHERE cliente_id = $1", [clienteId]);
  await db.query("DELETE FROM transacoes WHERE cliente_id = $1", [clienteId]);
  await db.query("DELETE FROM clientes WHERE id = $1", [clienteId]);
  await db.query("COMMIT");
}
