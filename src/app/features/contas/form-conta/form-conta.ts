import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContaService } from '../../../core/services/conta.service';
import { MoradorService, Morador } from '../../../core/services/morador.service';
import { TipoConta, SituacaoConta, Conta, CreateContaRequest, UpdateContaRequest } from '../../../models/models';

interface RateioForm {
  moradorId: number;
  valor: number;
  tipo: 'Pago' | 'Em aberto';
}

@Component({
  selector: 'app-form-conta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-conta.html',
  styleUrl: './form-conta.scss'
})
export class FormConta implements OnInit, OnChanges {
  @Input() contaParaEdicao: Conta | null = null;
  @Input() titulo: string = 'Cadastrar Conta';
  @Output() contaSalva = new EventEmitter<Conta>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  conta: CreateContaRequest = this.resetConta();
  moradores: Morador[] = [];
  rateios: RateioForm[] = [];
  novoRateio: RateioForm = this.resetNovoRateio();

  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'error' = 'success';
  isEdicao = false;

  TipoConta = TipoConta;
  SituacaoConta = SituacaoConta;

  constructor(
    private contaService: ContaService,
    private moradorService: MoradorService
  ) { }

  ngOnInit() {
    this.carregarMoradores();
    this.configurarFormulario();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contaParaEdicao']) {
      this.configurarFormulario();
    }
  }

  private configurarFormulario() {
    if (this.contaParaEdicao) {
      this.isEdicao = true;
      this.conta = {
        moradorResponsavelId: this.contaParaEdicao.moradorResponsavelId,
        valor: this.contaParaEdicao.valor,
        dataVencimento: this.contaParaEdicao.dataVencimento,
        tipoConta: this.contaParaEdicao.tipoConta,
        situacao: this.contaParaEdicao.situacao,
        observacao: this.contaParaEdicao.observacao || '',
        rateios: []
      };
      this.titulo = 'Editar Conta';
      this.mensagem = '';

      if (this.contaParaEdicao.id) {
        this.carregarRateios(this.contaParaEdicao.id);
      }
    } else {
      this.isEdicao = false;
      this.conta = this.resetConta();
      this.rateios = [];
      this.titulo = 'Cadastrar Conta';
      this.mensagem = '';
    }
  }

  resetConta(): CreateContaRequest {
    return {
      moradorResponsavelId: 0,
      valor: 0,
      dataVencimento: '',
      tipoConta: TipoConta.OUTROS,
      situacao: SituacaoConta.EM_ABERTO,
      observacao: '',
      rateios: []
    };
  }

  resetNovoRateio(): RateioForm {
    return {
      moradorId: 0,
      valor: 0,
      tipo: 'Em aberto'
    };
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

  carregarRateios(contaId: number) {
    this.contaService.getRateiosByConta(contaId).subscribe({
      next: (rateios) => {
        this.rateios = rateios.map(rateio => ({
          moradorId: rateio.moradorId,
          valor: rateio.valor,
          tipo: rateio.situacao === 'Pago' ? 'Pago' : 'Em aberto'
        }));
      },
      error: (error) => {
        console.error('Erro ao carregar rateios:', error);
      }
    });
  }

  adicionarRateio() {
    if (this.novoRateio.moradorId === 0 || this.novoRateio.valor <= 0) {
      this.exibirMensagem('Selecione um morador e informe um valor válido', 'error');
      return;
    }

    const moradorJaAdicionado = this.rateios.find(r => r.moradorId === this.novoRateio.moradorId);
    if (moradorJaAdicionado) {
      this.exibirMensagem('Este morador já foi adicionado ao rateio', 'error');
      return;
    }

    this.rateios.push({ ...this.novoRateio });
    this.novoRateio = this.resetNovoRateio();
  }

  removerRateio(index: number) {
    this.rateios.splice(index, 1);
  }

  dividirIgualmente() {
    if (this.conta.valor <= 0 || this.moradores.length === 0) {
      this.exibirMensagem('Informe o valor da conta primeiro', 'error');
      return;
    }

    this.rateios = [];
    const valorPorMorador = this.conta.valor / this.moradores.length;

    this.moradores.forEach(morador => {
      this.rateios.push({
        moradorId: morador.id!,
        valor: Math.round(valorPorMorador * 100) / 100,
        tipo: 'Em aberto'
      });
    });

    const totalRateios = this.getTotalRateios();
    const diferenca = this.conta.valor - totalRateios;

    if (diferenca !== 0 && this.rateios.length > 0) {
      this.rateios[this.rateios.length - 1].valor += diferenca;
      this.rateios[this.rateios.length - 1].valor = Math.round(this.rateios[this.rateios.length - 1].valor * 100) / 100;
    }
  }

  getTotalRateios(): number {
    return this.rateios.reduce((total, rateio) => total + rateio.valor, 0);
  }

  onSubmit() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mensagem = '';

    this.conta.rateios = this.rateios.map(r => ({
      moradorId: r.moradorId,
      valor: r.valor
    }));

    if (this.isEdicao && this.contaParaEdicao?.id) {
      this.atualizarConta();
    } else {
      this.criarConta();
    }
  }

  private criarConta() {
    this.contaService.create(this.conta).subscribe({
      next: (conta) => {
        this.exibirMensagem('Conta cadastrada com sucesso!', 'success');
        this.conta = this.resetConta();
        this.rateios = [];
        this.novoRateio = this.resetNovoRateio();
        this.contaSalva.emit(conta);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao cadastrar conta:', error);
        this.exibirMensagem(error.message || 'Erro ao cadastrar conta. Tente novamente.', 'error');
        this.isLoading = false;
      }
    });
  }

  private atualizarConta() {
    const request: UpdateContaRequest = {
      id: this.contaParaEdicao!.id!,
      moradorResponsavelId: this.conta.moradorResponsavelId,
      valor: this.conta.valor,
      dataVencimento: this.conta.dataVencimento,
      tipoConta: this.conta.tipoConta,
      observacao: this.conta.observacao,
      situacao: this.conta.situacao,
      rateios: this.conta.rateios
    };

    this.contaService.update(request).subscribe({
      next: (conta) => {
        this.exibirMensagem('Conta atualizada com sucesso!', 'success');
        this.contaSalva.emit(conta);

        setTimeout(() => {
          this.cancelarEdicao.emit();
        }, 1500);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar conta:', error);
        this.exibirMensagem(error.message || 'Erro ao atualizar conta. Tente novamente.', 'error');
        this.isLoading = false;
      }
    });
  }

  private validarFormulario(): boolean {
    if (!this.conta.moradorResponsavelId) {
      this.exibirMensagem('Selecione o morador responsável', 'error');
      return false;
    }

    if (this.conta.valor <= 0) {
      this.exibirMensagem('Valor deve ser maior que zero', 'error');
      return false;
    }

    if (!this.conta.dataVencimento) {
      this.exibirMensagem('Data de vencimento é obrigatória', 'error');
      return false;
    }

    if (!this.conta.situacao) {
      this.exibirMensagem('Selecione a situação da conta', 'error');
      return false;
    }

    if (this.rateios.length === 0) {
      this.exibirMensagem('Adicione pelo menos um rateio', 'error');
      return false;
    }

    const totalRateios = this.getTotalRateios();
    if (Math.abs(totalRateios - this.conta.valor) > 0.01) {
      this.exibirMensagem('A soma dos rateios deve ser igual ao valor total da conta', 'error');
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

  getMoradorNome(moradorId: number): string {
    const morador = this.moradores.find(m => m.id == moradorId);
    return morador ? morador.nome : 'Desconhecido';
  }

  cancelar() {
    if (this.isEdicao) {
      if (confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
        this.cancelarEdicao.emit();
      }
    } else {
      this.conta = this.resetConta();
      this.rateios = [];
      this.novoRateio = this.resetNovoRateio();
      this.mensagem = '';
    }
  }
}
