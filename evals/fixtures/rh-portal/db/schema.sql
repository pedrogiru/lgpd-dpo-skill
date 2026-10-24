CREATE TABLE colaboradores (
  id            uuid PRIMARY KEY,
  nome          text NOT NULL,
  cpf           text NOT NULL UNIQUE,
  email         text NOT NULL,
  gestor_id     uuid REFERENCES colaboradores(id),
  admitido_em   date NOT NULL,
  desligado_em  date
);

CREATE TABLE atestados (
  id              uuid PRIMARY KEY,
  colaborador_id  uuid NOT NULL REFERENCES colaboradores(id),
  data_inicio     date NOT NULL,
  dias            int  NOT NULL,
  cid             text,            -- código CID-10 informado no atestado
  arquivo_url     text NOT NULL,   -- PDF/foto do atestado no bucket "atestados"
  criado_em       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE aso (
  id               uuid PRIMARY KEY,
  colaborador_id   uuid NOT NULL REFERENCES colaboradores(id),
  tipo             text NOT NULL,   -- admissional, periodico, retorno, mudanca_funcao, demissional
  resultado        text NOT NULL,   -- apto | inapto
  valido_ate       date,
  exames           jsonb NOT NULL,  -- exames complementares e resultados
  anamnese         text,
  medico_crm       text NOT NULL,
  emitido_em       date NOT NULL
);

CREATE TABLE ponto_biometria (
  colaborador_id   uuid PRIMARY KEY REFERENCES colaboradores(id),
  template_digital bytea NOT NULL,  -- template ISO/IEC 19794-2 lido do relógio de ponto
  cadastrado_em    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE marcacoes_ponto (
  id              bigserial PRIMARY KEY,
  colaborador_id  uuid NOT NULL REFERENCES colaboradores(id),
  marcado_em      timestamptz NOT NULL,
  relogio_id      text NOT NULL
);

CREATE TABLE folha_pagamento (
  id              uuid PRIMARY KEY,
  colaborador_id  uuid NOT NULL REFERENCES colaboradores(id),
  competencia     date NOT NULL,
  salario_bruto   numeric(12,2) NOT NULL,
  descontos       jsonb NOT NULL,
  liquido         numeric(12,2) NOT NULL
);

CREATE TABLE candidaturas (
  id              uuid PRIMARY KEY,
  vaga_id         uuid NOT NULL,
  nome            text NOT NULL,
  email           text NOT NULL,
  telefone        text,
  pretensao       numeric(12,2),
  curriculo_url   text NOT NULL,   -- PDF no bucket "curriculos"
  status          text NOT NULL DEFAULT 'recebida', -- recebida | entrevista | reprovada | contratada
  criado_em       timestamptz NOT NULL DEFAULT now()
);
