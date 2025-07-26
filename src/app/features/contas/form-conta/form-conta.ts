import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContaService } from '../../../core/services/conta.service';
import { MoradorService, Morador } from '../../../core/services/morador.service';
import { TipoConta, SituacaoConta, Conta, CreateContaRequest, UpdateContaRequest, SituacaoRateio } from '../../../models/models';

interface RateioForm {
  id?: number;
  moradorId: number;
  idConta?: number;
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

  conta: Conta = this.resetConta();
  tiposConta: TipoConta[] = [];
  moradores: Morador[] = [];
  rateios: RateioForm[] = [];
  novoRateio: RateioForm = this.resetNovoRateio();

  // Lista dos IDs dos rateios originais para controlar exclusões
  rateiosOriginais: number[] = [];

  isLoading = false;
  mensagem = '';
  tipoMensagem: 'success' | 'error' = 'success';
  isEdicao = false;

  // Propriedades para controlar edição de rateios
  rateioEditandoIndex: number | null = null;
  rateioBackup: RateioForm | null = null;

  SituacaoConta = SituacaoConta;

  constructor(
    private contaService: ContaService,
    private moradorService: MoradorService
  ) { }

  ngOnInit() {
    this.carregarTiposConta();
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
        tipoContaId: this.contaParaEdicao.tipoContaId,
        situacao: this.contaParaEdicao.situacao,
        observacao: this.contaParaEdicao.observacao || '',
      };
      this.titulo = 'Editar Conta';
      this.mensagem = '';

      // Carregar rateios com ID para mostrar como existentes
      if (this.contaParaEdicao.rateios && this.contaParaEdicao.rateios.length > 0) {
        this.rateios = this.contaParaEdicao.rateios.map(rateio => ({
          id: rateio.id,
          moradorId: rateio.moradorId,
          idConta: rateio.idConta,
          valor: rateio.valor,
          tipo: this.mapearEnumParaSituacao(rateio.situacao) as 'Pago' | 'Em aberto'
        }));

        // Salvar os IDs originais para controlar exclusões
        this.rateiosOriginais = this.contaParaEdicao.rateios
          .filter(r => r.id)
          .map(r => r.id!);

      } else {
        this.rateios = [];
        this.rateiosOriginais = [];
      }
    } else {
      this.isEdicao = false;
      this.conta = this.resetConta();
      this.rateios = [];
      this.rateiosOriginais = [];
      this.titulo = 'Cadastrar Conta';
      this.mensagem = '';
    }
  }

  resetConta(): Conta {
    return {
      moradorResponsavelId: 0,
      valor: 0,
      dataVencimento: '',
      tipoConta: this.tiposConta?.[0] || { id: 0, descricao: 'Selecione um tipo' },
      tipoContaId: this.tiposConta?.[0]?.id || 0,
      situacao: SituacaoConta.PENDENTE,
      observacao: '',
    };
  }

  resetNovoRateio(): RateioForm {
    return {
      moradorId: 0,
      idConta: 0,
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

  carregarTiposConta() {
    this.contaService.getTiposConta().subscribe({
      next: (tipos) => {
        this.tiposConta = tipos;
        // Definir o primeiro tipo como padrão
        if (tipos.length > 0) {
          this.conta.tipoContaId = tipos[0].id;
          this.conta.tipoConta = tipos[0];
        }
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de conta:', error);
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
    const rateio = this.rateios[index];

    if (rateio.id && this.isEdicao) {
      // Se é um rateio existente na edição, confirmar exclusão
      if (confirm('Tem certeza que deseja excluir este rateio? Esta ação será aplicada ao salvar.')) {
        this.rateios.splice(index, 1);
      }
    } else {
      // Se é um rateio novo, apenas remove da lista
      this.rateios.splice(index, 1);
    }
  }

  dividirIgualmente() {
    if (this.conta.valor <= 0 || this.moradores.length === 0) {
      this.exibirMensagem('Informe o valor da conta primeiro', 'error');
      return;
    }

    // Cancelar qualquer edição em andamento
    this.cancelarTodasEdicoes();

    // Sempre gerar novos rateios (sem ID)
    this.rateios = [];
    const valorPorMorador = this.conta.valor / this.moradores.length;

    this.moradores.forEach(morador => {
      this.rateios.push({
        // Não incluir ID - sempre novos registros
        moradorId: morador.id!,
        idConta: this.conta.id || 0,
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

  private cancelarTodasEdicoes() {
    this.rateioEditandoIndex = null;
    this.rateioBackup = null;
  }

  getTotalRateios(): number {
    return this.rateios.reduce((total, rateio) => total + rateio.valor, 0);
  }

  onSubmit() {
    // Verificar se há rateio sendo editado
    if (this.rateioEditandoIndex !== null) {
      this.exibirMensagem('Finalize a edição do rateio antes de salvar', 'error');
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;
    this.mensagem = '';

    if (this.isEdicao && this.contaParaEdicao?.id) {
      this.atualizarConta();
    } else {
      this.criarConta();
    }
  }

  private criarConta() {
    const request: CreateContaRequest = {
      moradorResponsavelId: this.conta.moradorResponsavelId,
      valor: this.conta.valor,
      dataVencimento: this.conta.dataVencimento,
      tipoContaId: this.conta.tipoContaId,
      observacao: this.conta.observacao,
      situacao: this.conta.situacao,
    };

    this.contaService.create(request).subscribe({
      next: (conta) => {
        if (this.rateios.length > 0 && conta.id) {
          this.salvarRateios(conta.id, conta);
        } else {
          this.finalizarCriacao(conta);
        }
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
      tipoContaId: this.conta.tipoContaId, // Usar tipoContaId diretamente
      observacao: this.conta.observacao,
      situacao: this.conta.situacao
    };

    this.contaService.update(request).subscribe({
      next: (conta) => {
        // Após atualizar a conta, atualizar os rateios
        if (this.rateios.length > 0 && conta.id) {
          this.atualizarRateios(conta.id, conta);
        } else {
          this.finalizarAtualizacao(conta);
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar conta:', error);
        this.exibirMensagem(error.message || 'Erro ao atualizar conta. Tente novamente.', 'error');
        this.isLoading = false;
      }
    });
  }

  // Método para mapear da interface para o enum
  private mapearSituacaoParaEnum(situacao: string): SituacaoRateio {
    switch (situacao) {
      case 'Pago':
        return SituacaoRateio.PAGO;
      case 'Em aberto':
        return SituacaoRateio.EM_ABERTO;
      default:
        return SituacaoRateio.EM_ABERTO;
    }
  }

  // Método para mapear do enum para a interface
  private mapearEnumParaSituacao(situacao: SituacaoRateio): string {
    switch (situacao) {
      case SituacaoRateio.PAGO:
        return 'Pago';
      case SituacaoRateio.EM_ABERTO:
        return 'Em aberto';
      default:
        return 'Em aberto';
    }
  }

  private salvarRateios(contaId: number, conta: Conta) {
    let rateiosSalvos = 0;
    const totalRateios = this.rateios.length;

    this.rateios.forEach((rateio, index) => {
      const rateioRequest = {
        idConta: contaId,
        moradorId: rateio.moradorId,
        valor: rateio.valor,
        situacao: this.mapearSituacaoParaEnum(rateio.tipo)
      };

      this.contaService.createRateio(rateioRequest).subscribe({
        next: () => {
          rateiosSalvos++;
          if (rateiosSalvos === totalRateios) {
            // Todos os rateios foram salvos
            this.finalizarCriacao(conta);
          }
        },
        error: (error) => {
          console.error(`Erro ao salvar rateio ${index + 1}:`, error);
          this.exibirMensagem(`Erro ao salvar rateio ${index + 1}. Tente novamente.`, 'error');
          this.isLoading = false;
        }
      });
    });
  }

  private atualizarRateios(contaId: number, conta: Conta) {
    // Separar rateios existentes dos novos
    const rateiosExistentes = this.rateios.filter(r => r.id);
    const rateiosNovos = this.rateios.filter(r => !r.id);

    // Identificar rateios que foram removidos (estavam nos originais mas não estão mais na lista atual)
    const idsAtuais = rateiosExistentes.map(r => r.id!);
    const rateiosParaExcluir = this.rateiosOriginais.filter(id => !idsAtuais.includes(id));

    let operacoesCompletas = 0;
    const totalOperacoes = rateiosExistentes.length + rateiosNovos.length + rateiosParaExcluir.length;

    if (totalOperacoes === 0) {
      this.finalizarAtualizacao(conta);
      return;
    }

    // Excluir rateios removidos
    rateiosParaExcluir.forEach((rateioId, index) => {
      this.contaService.deleteRateio(rateioId).subscribe({
        next: () => {
          operacoesCompletas++;
          if (operacoesCompletas === totalOperacoes) {
            this.finalizarAtualizacao(conta);
          }
        },
        error: (error) => {
          console.error(`Erro ao excluir rateio ${rateioId}:`, error);
          this.exibirMensagem(`Erro ao excluir rateio ${index + 1}`, 'error');
          this.isLoading = false;
        }
      });
    });

    // Atualizar rateios existentes
    rateiosExistentes.forEach((rateio, index) => {
      const rateioRequest = {
        id: rateio.id!,
        idConta: contaId,
        moradorId: rateio.moradorId,
        valor: rateio.valor,
        situacao: this.mapearSituacaoParaEnum(rateio.tipo)
      };

      this.contaService.updateRateio(rateioRequest).subscribe({
        next: () => {
          operacoesCompletas++;
          if (operacoesCompletas === totalOperacoes) {
            this.finalizarAtualizacao(conta);
          }
        },
        error: (error) => {
          console.error(`Erro ao atualizar rateio existente ${index + 1}:`, error);
          this.exibirMensagem(`Erro ao atualizar rateio ${index + 1}`, 'error');
          this.isLoading = false;
        }
      });
    });

    // Criar novos rateios
    rateiosNovos.forEach((rateio, index) => {
      const rateioRequest = {
        idConta: contaId,
        moradorId: rateio.moradorId,
        valor: rateio.valor,
        situacao: this.mapearSituacaoParaEnum(rateio.tipo)
      };

      this.contaService.createRateio(rateioRequest).subscribe({
        next: () => {
          operacoesCompletas++;
          if (operacoesCompletas === totalOperacoes) {
            this.finalizarAtualizacao(conta);
          }
        },
        error: (error) => {
          console.error(`Erro ao criar novo rateio ${index + 1}:`, error);
          this.exibirMensagem(`Erro ao criar rateio ${index + 1}`, 'error');
          this.isLoading = false;
        }
      });
    });
  }

  private finalizarCriacao(conta: Conta) {
    this.exibirMensagem('Conta e rateios cadastrados com sucesso!', 'success');
    this.conta = this.resetConta();
    this.rateios = [];
    this.novoRateio = this.resetNovoRateio();
    this.contaSalva.emit(conta);
    this.isLoading = false;
  }

  private finalizarAtualizacao(conta: Conta) {
    this.exibirMensagem('Conta e rateios atualizados com sucesso!', 'success');
    this.contaSalva.emit(conta);
    this.cancelarEdicao.emit();
    this.isLoading = false;
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
      this.rateiosOriginais = []; // Limpar também os originais
      this.novoRateio = this.resetNovoRateio();
      this.mensagem = '';
    }
  }

  onTipoContaChange() {
    const tipoSelecionado = this.tiposConta.find(tipo => tipo.id == this.conta.tipoContaId);
    if (tipoSelecionado) {
      this.conta.tipoConta = tipoSelecionado;
    }
  }

  // Métodos para edição de rateios
  editarRateio(index: number) {
    if (this.rateioEditandoIndex !== null) {
      this.exibirMensagem('Finalize a edição do rateio atual primeiro', 'error');
      return;
    }

    this.rateioEditandoIndex = index;
    // Fazer backup do rateio original
    this.rateioBackup = { ...this.rateios[index] };
  }

  salvarEdicaoRateio(index: number) {
    const rateio = this.rateios[index];

    // Validar o rateio editado
    if (!rateio.moradorId || rateio.valor <= 0) {
      this.exibirMensagem('Selecione um morador e informe um valor válido', 'error');
      return;
    }

    // Verificar se não há outro morador com o mesmo ID
    const moradorDuplicado = this.rateios.find((r, i) =>
      i !== index && r.moradorId === rateio.moradorId
    );

    if (moradorDuplicado) {
      this.exibirMensagem('Este morador já foi adicionado ao rateio', 'error');
      return;
    }

    this.rateioEditandoIndex = null;
    this.rateioBackup = null;
    this.exibirMensagem('Rateio atualizado', 'success');
  }

  cancelarEdicaoRateio(index: number) {
    if (this.rateioBackup) {
      // Restaurar o rateio original
      this.rateios[index] = { ...this.rateioBackup };
    }

    this.rateioEditandoIndex = null;
    this.rateioBackup = null;
  }
}
