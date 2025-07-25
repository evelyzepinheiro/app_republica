import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContaService } from '../../core/services/conta.service';
import { FormConta } from './form-conta/form-conta';
import { ListaContas } from './lista-contas/lista-contas';
import { Conta } from '../../models/models';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-contas',
  standalone: true,
  imports: [CommonModule, FormConta, ListaContas, Navbar],
  templateUrl: './contas.html',
  styleUrl: './contas.scss'
})
export class Contas implements OnInit {
  contas: Conta[] = [];
  carregandoContas = false;
  contaParaEdicao: Conta | null = null;
  mensagemGeral = '';
  tipoMensagemGeral: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private contaService: ContaService
  ) { }

  ngOnInit() {
    this.carregarContas();
  }

  carregarContas() {
    this.carregandoContas = true;
    this.mensagemGeral = '';

    this.contaService.getAll().subscribe({
      next: (contas) => {
        this.contas = contas;
        this.carregandoContas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
        this.exibirMensagemGeral('Erro ao carregar contas', 'error');
        this.carregandoContas = false;
      }
    });
  }

  onContaSalva(conta: Conta) {
    this.carregarContas();

    if (this.contaParaEdicao) {
      this.exibirMensagemGeral('Conta atualizada com sucesso!', 'success');
    } else {
      this.exibirMensagemGeral('Conta cadastrada com sucesso!', 'success');
    }
  }

  onEditarConta(conta: Conta) {
    this.contaParaEdicao = { ...conta };
    this.mensagemGeral = '';

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  onCancelarEdicao() {
    this.contaParaEdicao = null;
    this.mensagemGeral = '';
  }

  onExcluirConta(conta: Conta) {
    if (conta.id) {
      this.contaService.delete(conta.id).subscribe({
        next: () => {
          this.exibirMensagemGeral('Conta excluída com sucesso!', 'success');
          this.carregarContas();

          if (this.contaParaEdicao?.id === conta.id) {
            this.contaParaEdicao = null;
          }
        },
        error: (error) => {
          console.error('Erro ao excluir conta:', error);
          this.exibirMensagemGeral(error.message || 'Erro ao excluir conta', 'error');
        }
      });
    }
  }

  private exibirMensagemGeral(texto: string, tipo: 'success' | 'error') {
    this.mensagemGeral = texto;
    this.tipoMensagemGeral = tipo;

    setTimeout(() => {
      this.mensagemGeral = '';
    }, 5000);
  }

  limparDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      this.contaService.clearAllData();
      this.carregarContas();
      this.contaParaEdicao = null;
      alert('Dados reinicializados!');
    }
  }
}
