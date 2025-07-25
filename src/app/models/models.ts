export interface Conta {
  id?: number;
  moradorResponsavelId: number;
  valor: number;
  dataVencimento: string;
  tipoConta: TipoConta;
  situacao: SituacaoConta;
  observacao?: string;
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
  tipoConta: TipoConta;
  observacao?: string;
  situacao: SituacaoConta;
  rateios: CreateRateioRequest[];
}

export interface UpdateContaRequest extends CreateContaRequest {
  id: number;
}

export interface CreateRateioRequest {
  moradorId: number;
  valor: number;
}

export enum TipoConta {
  ALUGUEL = 'Aluguel',
  AGUA = 'Água',
  LUZ = 'Luz',
  GAS = 'Gás',
  INTERNET = 'Internet',
  TELEFONE = 'Telefone',
  OUTROS = 'Outros'
}

export enum SituacaoConta {
  PAGO = 'Pago',
  EM_ABERTO = 'Em aberto',
  
}

export enum SituacaoRateio {
  PAGO = 'Pago',
  EM_ABERTO = 'Em aberto'
}
