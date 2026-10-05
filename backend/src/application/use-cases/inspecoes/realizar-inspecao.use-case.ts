import { ResultadoInspecao } from '../../../domain/enums.js';
import { Inspecao } from '../../../domain/entities/inspecao.entity.js';
import { generateEntityId } from '../../id-generator.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { RealizarInspecaoInputDto } from '../../dtos/carga-quimica.dto.js';

export class RealizarInspecaoUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(input: RealizarInspecaoInputDto): Promise<void> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      throw new Error('Carga química não encontrada.');
    }

    const inspecao = new Inspecao({
      id: generateEntityId('INS'),
      dataSolicitacao: input.dataSolicitacao,
      dataRealizacao: input.dataRealizacao,
      inspetorId: input.inspetorId,
      resultado: ResultadoInspecao[input.resultado],
      observacoes: input.observacoes,
    });

    carga.registrarInspecao(inspecao);
    await this.cargaRepository.salvar(carga);
  }
}
