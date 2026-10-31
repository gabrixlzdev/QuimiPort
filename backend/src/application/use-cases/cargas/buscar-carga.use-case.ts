import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { CargaQuimicaMapper } from '../../mappers/carga-quimica.mapper.js';
import { CargaQuimicaOutputDto } from '../../dtos/carga-quimica.dto.js';

export type BuscarCargaError = CargaNaoEncontradaError;

export class BuscarCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    id: string,
  ): Promise<Either<BuscarCargaError, CargaQuimicaOutputDto>> {
    const carga = await this.cargaRepository.buscarPorId(id);
    if (!carga) {
      return left(new CargaNaoEncontradaError(id));
    }

    return right(CargaQuimicaMapper.toOutput(carga));
  }
}
