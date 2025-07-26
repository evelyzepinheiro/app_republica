import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { HttpService } from './http.service';
import { MoradorService } from './morador.service';
import { Conta, CreateContaRequest, CreateRateioRequest, Rateio, SituacaoConta, SituacaoRateio, TipoConta, UpdateContaRequest, UpdateRateioRequest } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class ContaService {
  private readonly endpoint = 'contas';
  private readonly rateioEndpoint = 'rateio';
  private readonly tipoContaEndpoint = 'tipos_conta';

  constructor(
    private httpService: HttpService
  ) { }

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
  // getRateiosByConta(contaId: number): Observable<Rateio[]> {
  //   return this.httpService.get<Rateio[]>(`${this.rateioEndpoint}/conta/${contaId}`);
  // }

  getTiposConta(): Observable<TipoConta[]> {
    return this.httpService.get<TipoConta[]>(this.tipoContaEndpoint);
  }

  createRateio(rateio: CreateRateioRequest): Observable<Rateio> {
    return this.httpService.post<Rateio>('rateio', rateio);
  }

  deleteRateiosByConta(contaId: number): Observable<void> {
    return this.httpService.delete<void>(`rateio/conta/${contaId}`);
  }

  getTipoContaById(id: number): Observable<TipoConta> {
    return this.httpService.get<TipoConta>(`${this.tipoContaEndpoint}/${id}`);
  }

  // Atualizar rateio individual
  updateRateio(rateio: UpdateRateioRequest): Observable<Rateio> {
    return this.httpService.put<Rateio>(`${this.rateioEndpoint}/${rateio.id}`, rateio);
  }

  // Excluir rateio individual
  deleteRateio(rateioId: number): Observable<void> {
    return this.httpService.delete<void>(`${this.rateioEndpoint}/${rateioId}`);
  }
}
