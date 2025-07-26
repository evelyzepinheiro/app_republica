// src/app/features/moradores/form-morador/form-morador.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoradorService, Morador, CreateMoradorRequest, UpdateMoradorRequest } from '../../../core/services/morador.service';

@Component({
  selector: 'app-form-morador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-morador.html',
  styleUrl: './form-morador.scss'
})
export class FormMorador implements OnInit, OnChanges {
  @Input() moradorParaEdicao: Morador | null = null;
  @Input() titulo: string = 'Cadastrar Morador';
  @Output() moradorSalvo = new EventEmitter<Morador>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  morador: Morador = this.resetMorador();
  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'error' = 'success';
  isEdicao = false;

  constructor(private moradorService: MoradorService) { }

  ngOnInit() {
    this.configurarFormulario();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['moradorParaEdicao']) {
      this.configurarFormulario();
    }
  }

  private configurarFormulario() {
    if (this.moradorParaEdicao) {
      this.isEdicao = true;
      this.morador = { ...this.moradorParaEdicao };
      this.titulo = 'Editar Morador';
      this.mensagem = '';
    } else {
      this.isEdicao = false;
      this.morador = this.resetMorador();
      this.titulo = 'Cadastrar Morador';
      this.mensagem = '';
    }
  }

  resetMorador(): Morador {
    return {
      nome: '',
      cpf: 0,
      data_nascimento: '',
      celular: '',
      email: ''
    };
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mensagem = '';

    if (this.isEdicao && this.morador.id) {
      this.atualizarMorador();
    } else {
      this.criarMorador();
    }
  }

  private criarMorador() {
    const request: CreateMoradorRequest = {
      nome: this.morador.nome.trim(),
      cpf: this.morador.cpf,
      data_nascimento: this.morador.data_nascimento,
      celular: this.morador.celular,
      email: this.morador.email.trim().toLowerCase()
    };

    this.moradorService.create(request).subscribe({
      next: (morador) => {
        this.exibirMensagem('Morador cadastrado com sucesso!', 'success');
        this.morador = this.resetMorador();
        this.moradorSalvo.emit(morador);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao cadastrar morador:', error);
        this.exibirMensagem(error.message || 'Erro ao cadastrar morador. Tente novamente.', 'error');
        this.isLoading = false;
      }
    });
  }

  private atualizarMorador() {
    const request: UpdateMoradorRequest = {
      id: this.morador.id!,
      nome: this.morador.nome.trim(),
      cpf: this.morador.cpf,
      data_nascimento: this.morador.data_nascimento,
      celular: this.morador.celular,
      email: this.morador.email.trim().toLowerCase()
    };

    this.moradorService.update(request).subscribe({
      next: (morador) => {
        this.exibirMensagem('Morador atualizado com sucesso!', 'success');
        this.moradorSalvo.emit(morador);

        this.cancelarEdicao.emit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar morador:', error);
        this.exibirMensagem(error.message || 'Erro ao atualizar morador. Tente novamente.', 'error');
        this.isLoading = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.morador.nome.trim()) {
      this.exibirMensagem('Nome é obrigatório', 'error');
      return false;
    }

    if (!this.morador.cpf) {
      this.exibirMensagem('CPF é obrigatório', 'error');
      return false;
    }

    if (!this.morador.email.trim()) {
      this.exibirMensagem('Email é obrigatório', 'error');
      return false;
    }

    if (!this.morador.data_nascimento) {
      this.exibirMensagem('Data de nascimento é obrigatória', 'error');
      return false;
    }

    if (!this.morador.celular) {
      this.exibirMensagem('Celular é obrigatório', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.morador.email)) {
      this.exibirMensagem('Email inválido', 'error');
      return false;
    }

    return true;
  }

  private exibirMensagem(texto: string, tipo: 'success' | 'error') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;

    setTimeout(() => {
      this.mensagem = '';
    }, 5000);
  }

  formatarCelular(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');

    if (valor.length <= 11) {
      valor = valor.replace(/(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    }

    this.morador.celular = valor;
  }

  cancelar() {
    if (this.isEdicao) {
      if (confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
        this.cancelarEdicao.emit();
      }
    } else {
      this.morador = this.resetMorador();
      this.mensagem = '';
    }
  }
}
