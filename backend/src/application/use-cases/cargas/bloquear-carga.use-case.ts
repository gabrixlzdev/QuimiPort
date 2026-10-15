import { BloqueioCargaError } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { BloquearCargaInputDto } from '../../dtos/carga-quimica.dto.js';

export type BloquearCargaError = CargaNaoEncontradaError | BloqueioCargaError;

export class BloquearCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: BloquearCargaInputDto,
  ): Promise<Either<BloquearCargaError, void>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const bloqueio = carga.bloquearCarga(input.motivo, input.responsavelId);
    if (bloqueio.kind === 'left') return bloqueio;

    await this.cargaRepository.salvar(carga);
    return right(undefined);
  }
}
