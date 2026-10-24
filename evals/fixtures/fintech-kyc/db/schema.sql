CREATE TABLE clientes (
  id              uuid PRIMARY KEY,
  nome            text NOT NULL,
  cpf             text NOT NULL UNIQUE,
  email           text NOT NULL,
  telefone        text NOT NULL,
  data_nascimento date NOT NULL,
  criado_em       timestamptz NOT NULL DEFAULT now()
);

-- Procedimentos de "conheça seu cliente" (PLD/FT)
CREATE TABLE kyc_verificacoes (
  id              uuid PRIMARY KEY,
  cliente_id      uuid NOT NULL REFERENCES clientes(id),
  renda_mensal    numeric(12,2),
  ocupacao        text,
  pep             boolean NOT NULL,          -- pessoa exposta politicamente
  score_risco     text NOT NULL,             -- baixo | medio | alto
  resultado       text NOT NULL,             -- aprovado | reprovado | revisao_manual
  verificado_em   timestamptz NOT NULL
);

CREATE TABLE kyc_documentos (
  id              uuid PRIMARY KEY,
  cliente_id      uuid NOT NULL REFERENCES clientes(id),
  tipo            text NOT NULL,             -- rg_frente | rg_verso | cnh | selfie | comprovante_residencia
  s3_key          text NOT NULL,
  enviado_em      timestamptz NOT NULL
);

CREATE TABLE transacoes (
  id              bigserial PRIMARY KEY,
  cliente_id      uuid NOT NULL REFERENCES clientes(id),
  tipo            text NOT NULL,             -- pix_in | pix_out | boleto | cartao
  valor           numeric(14,2) NOT NULL,
  contraparte     jsonb,
  realizada_em    timestamptz NOT NULL
);

CREATE TABLE preferencias_marketing (
  cliente_id      uuid PRIMARY KEY REFERENCES clientes(id),
  email_ofertas   boolean NOT NULL DEFAULT false,
  push_ofertas    boolean NOT NULL DEFAULT false
);

CREATE TABLE sessoes (
  id              uuid PRIMARY KEY,
  cliente_id      uuid NOT NULL REFERENCES clientes(id),
  expira_em       timestamptz NOT NULL
);
