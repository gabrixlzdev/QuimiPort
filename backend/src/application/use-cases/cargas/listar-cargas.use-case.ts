import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, right } from '../../../shared/either.js';
import { CargaQuimicaMapper } from '../../mappers/carga-quimica.mapper.js';
import { CargaQuimicaOutputDto } from '../../dtos/carga-quimica.dto.js';

export class ListarCargasUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  // Listar não tem falha de negócio esperada: o lado "left" é `never`.
  async execute(): Promise<Either<never, CargaQuimicaOutputDto[]>> {
    const cargas = await this.cargaRepository.listar();
    return right(cargas.map((carga) => CargaQuimicaMapper.toOutput(carga)));
  }
}
