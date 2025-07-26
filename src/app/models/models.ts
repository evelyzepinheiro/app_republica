export interface Conta {
  id?: number;
  moradorResponsavelId: number;
  valor: number;
  dataVencimento: string;
  tipoConta: TipoConta;
  tipoContaId: number;
  situacao: SituacaoConta;
  observacao?: string;
  rateios?: Rateio[];
}

export interface Rateio {
  id?: number;
  idConta: number;
  moradorId: number;
  valor: number;
  situacao: SituacaoRateio;
}

export interface CreateContaRequest {
  moradorResponsavelId: number;
  valor: number;
  dataVencimento: string;
  tipoContaId: number;
  observacao?: string;
  situacao: SituacaoConta;
}

export interface UpdateContaRequest extends CreateContaRequest {
  id: number;
}

export interface CreateRateioRequest {
  moradorId: number;
  idConta: number;
  valor: number;
  situacao: SituacaoRateio;
}

export interface UpdateRateioRequest extends CreateRateioRequest {
  id: number;
}

export interface TipoConta {
  id: number;
  descricao: string;
  observacao?: string;
}

// export enum TipoConta {
//   ALUGUEL = 'Aluguel',
//   AGUA = 'Água',
//   LUZ = 'Luz',
//   GAS = 'Gás',
//   INTERNET = 'Internet',
//   TELEFONE = 'Telefone',
//   OUTROS = 'Outros'
// }

export enum SituacaoConta {
  QUITADA = 'QUITADA',
  PENDENTE = 'PENDENTE',
  CANCELADA = 'CANCELADA'
}

export enum SituacaoRateio {
  PAGO = 'PAGO',
  EM_ABERTO = 'EM_ABERTO'
}
