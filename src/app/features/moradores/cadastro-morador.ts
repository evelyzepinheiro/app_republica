import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MoradorService, Morador } from '../../core/services/morador.service';
import { FormMorador } from './form-morador/form-morador';
import { ListaMoradores } from './lista-moradores/lista-moradores';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-cadastro-morador',
  standalone: true,
  imports: [CommonModule, FormMorador, ListaMoradores, Navbar],
  templateUrl: './cadastro-morador.html',
  styleUrl: './cadastro-morador.scss'
})
export class CadastroMorador implements OnInit {
  moradores: Morador[] = [];
  carregandoMoradores = false;
  moradorParaEdicao: Morador | null = null;
  mensagemGeral = '';
  tipoMensagemGeral: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private moradorService: MoradorService
  ) { }

  ngOnInit() {
    this.carregarMoradores();
  }

  carregarMoradores() {
    this.carregandoMoradores = true;
    this.mensagemGeral = '';

    this.moradorService.getAll().subscribe({
      next: (moradores) => {
        this.moradores = moradores;
        this.carregandoMoradores = false;
      },
      error: (error) => {
        console.error('Erro ao carregar moradores:', error);
        this.exibirMensagemGeral('Erro ao carregar moradores', 'error');
        this.carregandoMoradores = false;
      }
    });
  }

  onMoradorSalvo(morador: Morador) {
    this.carregarMoradores();

    if (this.moradorParaEdicao) {
      this.exibirMensagemGeral('Morador atualizado com sucesso!', 'success');
    } else {
      this.exibirMensagemGeral('Morador cadastrado com sucesso!', 'success');
    }
  }

  onEditarMorador(morador: Morador) {
    this.moradorParaEdicao = { ...morador };
    this.mensagemGeral = '';

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  onCancelarEdicao() {
    this.moradorParaEdicao = null;
    this.mensagemGeral = '';
  }

  onExcluirMorador(morador: Morador) {
    if (morador.id) {
      this.moradorService.delete(morador.id).subscribe({
        next: () => {
          this.exibirMensagemGeral('Morador excluído com sucesso!', 'success');
          this.carregarMoradores();

          if (this.moradorParaEdicao?.id === morador.id) {
            this.moradorParaEdicao = null;
          }
        },
        error: (error) => {
          console.error('Erro ao excluir morador:', error);
          this.exibirMensagemGeral(error.message || 'Erro ao excluir morador', 'error');
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
}
