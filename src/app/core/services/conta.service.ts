import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { HttpService } from './http.service';
import { MoradorService } from './morador.service';
import { Conta, CreateContaRequest, Rateio, SituacaoConta, SituacaoRateio, TipoConta, UpdateContaRequest } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class ContaService {
  private readonly endpoint = 'contas';
  private readonly rateioEndpoint = 'rateios';
  private readonly STORAGE_KEY = 'contas';
  private readonly RATEIO_STORAGE_KEY = 'rateios';

  constructor(
    private httpService: HttpService,
    private moradorService: MoradorService
  ) {
    // this.initializeMockData();
  }

  // private initializeMockData(): void {
    // if (!this.getContasFromStorage().length) {
    //   const initialContas: Conta[] = [
    //     {
    //       id: 1,
    //       moradorResponsavelId: 1,
    //       valor: 100.00,
    //       dataVencimento: '2025-01-15',
    //       tipoConta: TipoConta.TELEFONE,
    //       situacao: SituacaoConta.PENDENTE,
    //       observacao: 'Observação 1'
    //     },
    //     {
    //       id: 2,
    //       moradorResponsavelId: 2,
    //       valor: 150.00,
    //       dataVencimento: '2025-01-20',
    //       tipoConta: TipoConta.AGUA,
    //       situacao: SituacaoConta.PENDENTE,
    //       observacao: 'Observação 2'
    //     }
    //   ];
    //   this.saveContasStorage(initialContas);

    //   const initialRateios: Rateio[] = [
    //     { id: 1, idConta: 1, moradorId: 1, valor: 25.00, situacao: SituacaoRateio.PENDENTE },
    //     { id: 2, idConta: 1, moradorId: 2, valor: 25.00, situacao: SituacaoRateio.PENDENTE },
    //     { id: 3, idConta: 1, moradorId: 3, valor: 50.00, situacao: SituacaoRateio.PENDENTE },
    //     { id: 4, idConta: 2, moradorId: 1, valor: 50.00, situacao: SituacaoRateio.PENDENTE },
    //     { id: 5, idConta: 2, moradorId: 2, valor: 50.00, situacao: SituacaoRateio.PENDENTE },
    //     { id: 6, idConta: 2, moradorId: 3, valor: 50.00, situacao: SituacaoRateio.PENDENTE }
    //   ];
    //   this.saveRateiosStorage(initialRateios);
    // }
  // }

  private getContasFromStorage(): Conta[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao ler contas do localStorage:', error);
      return [];
    }
  }

  private saveContasStorage(contas: Conta[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contas));
    } catch (error) {
      console.error('Erro ao salvar contas no localStorage:', error);
    }
  }

  private getRateiosFromStorage(): Rateio[] {
    try {
      const data = localStorage.getItem(this.RATEIO_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao ler rateios do localStorage:', error);
      return [];
    }
  }

  private saveRateiosStorage(rateios: Rateio[]): void {
    try {
      localStorage.setItem(this.RATEIO_STORAGE_KEY, JSON.stringify(rateios));
    } catch (error) {
      console.error('Erro ao salvar rateios no localStorage:', error);
    }
  }

  // Listar todas as contas
  getAll(): Observable<Conta[]> {
    return this.httpService.get<Conta[]>(this.endpoint);
  }

  // Buscar conta por ID
  getById(id: number): Observable<Conta> {
    return this.httpService.get<Conta>(`${this.endpoint}/${id}`);
  }

  // Criar nova conta
  create(request: CreateContaRequest): Observable<Conta> {
    return this.httpService.post<Conta>(this.endpoint, request);
  }

  // Atualizar conta
  update(conta: UpdateContaRequest): Observable<Conta> {
    return this.httpService.put<Conta>(`${this.endpoint}/${conta.id}`, conta);
  }

  // Deletar conta
  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(`${this.endpoint}/${id}`);
  }

  // Buscar rateios por conta
  getRateiosByConta(contaId: number): Observable<Rateio[]> {
    return this.httpService.get<Rateio[]>(`${this.rateioEndpoint}/conta/${contaId}`);
  }

  // Limpar todos os dados
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.RATEIO_STORAGE_KEY);
    // this.initializeMockData();
  }
}
