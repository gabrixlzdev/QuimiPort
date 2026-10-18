import { LiberacaoCargaError } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { LiberarCargaInputDto } from '../../dtos/carga-quimica.dto.js';

export type LiberarCargaError = CargaNaoEncontradaError | LiberacaoCargaError;

export class LiberarCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: LiberarCargaInputDto,
  ): Promise<Either<LiberarCargaError, void>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const liberacao = carga.liberarCarga(
      input.justificativa,
      input.responsavelId,
    );
    if (liberacao.kind === 'left') return liberacao;

    await this.cargaRepository.salvar(carga);
    return right(undefined);
  }
}
