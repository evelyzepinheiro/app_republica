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
  private readonly STORAGE_KEY = 'moradores';

  constructor(private httpService: HttpService) {
    // this.initializeMockData();
  }

  // private initializeMockData(): void {
  //   if (!this.getMoradoresFromStorage().length) {
  //     const initialData: Morador[] = [
  //       {
  //         id: 1,
  //         nome: 'João Silva',
  //         cpf: '123.456.789-00',
  //         data_nascimento: '1990-05-15',
  //         celular: '(11) 99999-9999',
  //         email: 'joao@email.com'
  //       },
  //       {
  //         id: 2,
  //         nome: 'Maria Santos',
  //         cpf: '987.654.321-00',
  //         data_nascimento: '1985-10-20',
  //         celular: '(11) 88888-8888',
  //         email: 'maria@email.com'
  //       },
  //       {
  //         id: 3,
  //         nome: 'Pedro Costa',
  //         cpf: '456.789.123-00',
  //         data_nascimento: '1992-08-20',
  //         celular: '(11) 77777-7777',
  //         email: 'pedro@email.com'
  //       }
  //     ];
  //     this.saveMoradoresStorage(initialData);
  //   }
  // }

  private getMoradoresFromStorage(): Morador[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao ler localStorage:', error);
      return [];
    }
  }

  private saveMoradoresStorage(moradores: Morador[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(moradores));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

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

  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // this.initializeMockData();
  }
}
