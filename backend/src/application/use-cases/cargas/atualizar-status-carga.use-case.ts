import {
  AlteracaoStatusError,
  BloqueioCargaError,
  LiberacaoCargaError,
} from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { StatusCarga } from '../../../domain/enums.js';
import {
  CargaNaoEncontradaError,
  TransicaoStatusInvalidaError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { AtualizarStatusCargaInputDto } from '../../dtos/carga-quimica.dto.js';

export type AtualizarStatusCargaError =
  | CargaNaoEncontradaError
  | LiberacaoCargaError
  | BloqueioCargaError
  | AlteracaoStatusError;

export class AtualizarStatusCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: AtualizarStatusCargaInputDto,
  ): Promise<Either<AtualizarStatusCargaError, void>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const transicao = this.aplicarTransicao(carga, input);
    if (transicao.kind === 'left') return transicao;

    await this.cargaRepository.salvar(carga);
    return right(undefined);
  }

  private aplicarTransicao(
    carga: Awaited<ReturnType<CargaQuimicaRepository['buscarPorId']>> & object,
    input: AtualizarStatusCargaInputDto,
  ): Either<
    LiberacaoCargaError | BloqueioCargaError | AlteracaoStatusError,
    void
  > {
    switch (input.status) {
      case StatusCarga.LIBERADA:
        return carga.liberarCarga(input.motivo, input.responsavelId);
      case StatusCarga.BLOQUEADA:
        return carga.bloquearCarga(input.motivo, input.responsavelId);
      case StatusCarga.EM_MOVIMENTACAO:
        return carga.iniciarMovimentacao(input.responsavelId, input.motivo);
      case StatusCarga.FINALIZADA:
        return carga.concluirMovimentacao(input.responsavelId, input.motivo);
      case StatusCarga.CANCELADA:
        return carga.cancelarCarga(input.responsavelId, input.motivo);
      default:
        return left(new TransicaoStatusInvalidaError(carga.status, input.status));
    }
  }
}
