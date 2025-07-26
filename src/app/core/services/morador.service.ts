import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { HttpService } from './http.service';

export interface Morador {
  id?: number;
  nome: string;
  cpf: number;
  data_nascimento: string;
  celular: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMoradorRequest {
  nome: string;
  cpf: number;
  data_nascimento: string;
  celular: string;
  email: string;
}

export interface UpdateMoradorRequest extends CreateMoradorRequest {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class MoradorService {
  private readonly endpoint = 'moradores';

  constructor(private httpService: HttpService) { }

  getAll(): Observable<Morador[]> {
    return this.httpService.get<Morador[]>(this.endpoint);
  }

  getById(id: number): Observable<Morador> {
    return this.httpService.get<Morador>(`${this.endpoint}/${id}`);
  }

  create(morador: CreateMoradorRequest): Observable<Morador> {
    return this.httpService.post<Morador>(this.endpoint, morador);
  }

  update(morador: UpdateMoradorRequest): Observable<Morador> {
    return this.httpService.put<Morador>(`${this.endpoint}/${morador.id}`, morador);
  }

  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(`${this.endpoint}/${id}`);
  }

  search(filters: {
    nome?: string;
    cpf?: string;
    email?: string;
  }): Observable<Morador[]> {

    return this.httpService.get<Morador[]>(this.endpoint, filters);
  }
}
