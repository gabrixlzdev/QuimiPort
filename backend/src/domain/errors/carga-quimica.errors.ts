import { StatusCarga } from '../enums.js';
import {
  DadosInvalidosError,
  RecursoNaoEncontradoError,
  RegraNegocioError,
} from './domain.error.js';

export class CargaQuimicaInvalidaError extends DadosInvalidosError {}

export class CodigoIdentificacaoInvalidoError extends DadosInvalidosError {
  constructor() {
    super(
      'CodigoIdentificacao inválido: deve conter 8-20 caracteres alfanuméricos sem espaços.',
    );
  }
}

export class QuantidadeInvalidaError extends DadosInvalidosError {
  constructor() {
    super('Quantidade da carga deve ser maior que zero.');
  }
}

export class UnidadeMedidaInvalidaError extends DadosInvalidosError {
  constructor() {
    super('Unidade de medida inválida para a carga.');
  }
}

export class AuditoriaStatusInvalidaError extends DadosInvalidosError {}

export class JustificativaLiberacaoObrigatoriaError extends DadosInvalidosError {
  constructor() {
    super('Justificativa de liberação é obrigatória.');
  }
}

export class MotivoBloqueioObrigatorioError extends DadosInvalidosError {
  constructor() {
    super('Motivo do bloqueio é obrigatório.');
  }
}

export class DocumentoCargaInvalidoError extends DadosInvalidosError {}

export class InspecaoInvalidaError extends DadosInvalidosError {}

export class TransicaoStatusInvalidaError extends RegraNegocioError {
  constructor(
    public readonly statusAtual: StatusCarga,
    public readonly statusSolicitado: StatusCarga,
  ) {
    super(
      `Transição de status inválida: ${statusAtual} -> ${statusSolicitado}.`,
    );
  }
}

export class CargaBloqueadaError extends RegraNegocioError {
  constructor() {
    super('Carga bloqueada não pode ser movimentada nem liberada.');
  }
}

export class CargaCanceladaError extends RegraNegocioError {
  constructor() {
    super('Carga cancelada não pode sofrer novas alterações.');
  }
}

export class CargaFinalizadaError extends RegraNegocioError {
  constructor() {
    super('Carga finalizada não pode sofrer novas alterações.');
  }
}

export class DocumentoObrigatorioAusenteError extends RegraNegocioError {
  constructor() {
    super('Impossível liberar: nenhuma documentação obrigatória anexada.');
  }
}

export class DocumentoPendenteError extends RegraNegocioError {
  constructor(public readonly documentoId: string) {
    super('Impossível liberar: documento pendente de validação.');
  }
}

export class DocumentoRejeitadoError extends RegraNegocioError {
  constructor(public readonly documentoId: string) {
    super('Impossível liberar: documento rejeitado.');
  }
}

export class DocumentoVencidoError extends RegraNegocioError {
  constructor(public readonly documentoId: string) {
    super('Impossível liberar: documento vencido.');
  }
}

export class InspecaoNaoAprovadaError extends RegraNegocioError {
  constructor() {
    super('Impossível liberar: nenhuma inspeção aprovada.');
  }
}

export class CargaNaoEncontradaError extends RecursoNaoEncontradoError {
  constructor(public readonly cargaQuimicaId: string) {
    super('Carga química não encontrada.');
  }
}

export class DocumentoNaoEncontradoError extends RecursoNaoEncontradoError {
  constructor(public readonly documentoId: string) {
    super('Documento não encontrado para a carga.');
  }
}
