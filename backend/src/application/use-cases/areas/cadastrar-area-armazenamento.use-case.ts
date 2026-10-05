import { AreaArmazenamento } from '../../../domain/entities/area-armazenamento.entity.js';
import { AreaArmazenamentoRepository } from '../../../domain/repositories/area-armazenamento.repository.interface.js';
import { generateEntityId } from '../../id-generator.js';
import {
  AreaArmazenamentoOutputDto,
  CadastrarAreaArmazenamentoInputDto,
} from '../../dtos/area-armazenamento.dto.js';

export class CadastrarAreaArmazenamentoUseCase {
  constructor(private readonly areaRepository: AreaArmazenamentoRepository) {}

  async execute(
    input: CadastrarAreaArmazenamentoInputDto,
  ): Promise<AreaArmazenamentoOutputDto> {
    const area = new AreaArmazenamento({
      id: generateEntityId('ARM'),
      nome: input.nome,
      codigo: input.codigo,
      tipo: input.tipo,
      cargaQuimicaId: input.cargaQuimicaId,
      capacidadeMaxima: input.capacidadeMaxima,
      quantidadeOcupada: input.quantidadeOcupada,
    });

    const salva = await this.areaRepository.salvar(area);
    return { id: salva.id };
  }
}
