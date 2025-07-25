import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conta, Rateio } from '../../../models/models';
import { ContaService } from '../../../core/services/conta.service';
import { MoradorService, Morador } from '../../../core/services/morador.service';

@Component({
  selector: 'app-lista-contas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-contas.html',
  styleUrl: './lista-contas.scss'
})
export class ListaContas implements OnInit {
  @Input() contas: Conta[] = [];
  @Input() carregando = false;
  @Output() editarConta = new EventEmitter<Conta>();
  @Output() excluirConta = new EventEmitter<Conta>();
  @Output() recarregarLista = new EventEmitter<void>();

  moradores: Morador[] = [];
  rateiosDetalhes: { [contaId: number]: Rateio[] } = {};

  constructor(
    private contaService: ContaService,
    private moradorService: MoradorService
  ) { }

  ngOnInit() {
    this.carregarMoradores();
  }

  ngOnChanges() {
    if (this.contas.length > 0) {
      this.carregarRateios();
    }
  }

  carregarMoradores() {
    this.moradorService.getAll().subscribe({
      next: (moradores) => {
        this.moradores = moradores;
      },
      error: (error) => {
        console.error('Erro ao carregar moradores:', error);
      }
    });
  }

  carregarRateios() {
    this.contas.forEach(conta => {
      if (conta.id) {
        this.contaService.getRateiosByConta(conta.id).subscribe({
          next: (rateios) => {
            if (conta.id) {
              this.rateiosDetalhes[conta.id] = rateios;
            }
          }
        });
      }
    });
  }

  onEditarConta(conta: Conta) {
    this.editarConta.emit(conta);
  }

  onExcluirConta(conta: Conta) {
    this.excluirConta.emit(conta);
  }

  onRecarregar() {
    this.recarregarLista.emit();
  }

  getMoradorNome(moradorId: number): string {
    const morador = this.moradores.find(m => m.id == moradorId);
    return morador ? morador.nome : 'Desconhecido';
  }

  getStatusBadgeClass(situacao: string): string {
    switch (situacao) {
      case 'Pago':
        return 'bg-success';
      case 'Pendente':
        return 'bg-warning';
      case 'Vencida':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
