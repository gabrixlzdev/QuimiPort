import { AlteracaoStatusError } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { AlterarStatusCargaInputDto } from '../../dtos/carga-quimica.dto.js';

export type CancelarCargaError =
  | CargaNaoEncontradaError
  | AlteracaoStatusError;

export class CancelarCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: AlterarStatusCargaInputDto,
  ): Promise<Either<CancelarCargaError, void>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const resultado = carga.cancelarCarga(input.responsavelId, input.motivo);
    if (resultado.kind === 'left') return resultado;

    await this.cargaRepository.salvar(carga);
    return right(undefined);
  }
}
