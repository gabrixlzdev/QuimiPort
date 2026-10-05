import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { BloquearCargaInputDto } from '../../dtos/carga-quimica.dto.js';

export class BloquearCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(input: BloquearCargaInputDto): Promise<void> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      throw new Error('Carga química não encontrada.');
    }

    carga.bloquearCarga(input.motivo, input.responsavelId);
    await this.cargaRepository.salvar(carga);
  }
}
