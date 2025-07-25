import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Morador, MoradorService } from '../../../core/services/morador.service';

@Component({
  selector: 'app-lista-moradores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-moradores.html',
  styleUrl: './lista-moradores.scss'
})
export class ListaMoradores implements OnInit {
  @Input() moradores: Morador[] = [];
  @Input() carregando = false;
  @Output() editarMorador = new EventEmitter<Morador>();
  @Output() excluirMorador = new EventEmitter<Morador>();
  @Output() recarregarLista = new EventEmitter<void>();

  constructor(private moradorService: MoradorService) { }

  ngOnInit() {
    // Componente inicializado
  }

  onEditarMorador(morador: Morador) {
    this.editarMorador.emit(morador);
  }

  onExcluirMorador(morador: Morador) {
    this.excluirMorador.emit(morador);
  }

  onRecarregar() {
    this.recarregarLista.emit();
  }

  calcularIdade(dataNascimento: string): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  }
}
