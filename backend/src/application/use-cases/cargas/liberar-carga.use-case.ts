import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { LiberarCargaInputDto } from '../../dtos/carga-quimica.dto.js';

export class LiberarCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(input: LiberarCargaInputDto): Promise<void> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      throw new Error('Carga química não encontrada.');
    }

    carga.liberarCarga(input.justificativa);
    await this.cargaRepository.salvar(carga);
  }
}
