import { AreaArmazenamento } from '../../../domain/entities/area-armazenamento.entity.js';
import {
  AreaArmazenamentoInvalidaError,
  CapacidadeExcedidaError,
} from '../../../domain/errors/area-armazenamento.errors.js';
import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { AreaArmazenamentoRepository } from '../../../domain/repositories/area-armazenamento.repository.interface.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { generateEntityId } from '../../id-generator.js';
import {
  AreaArmazenamentoOutputDto,
  CadastrarAreaArmazenamentoInputDto,
} from '../../dtos/area-armazenamento.dto.js';

export type CadastrarAreaArmazenamentoError =
  | CargaNaoEncontradaError
  | AreaArmazenamentoInvalidaError
  | CapacidadeExcedidaError;

export class CadastrarAreaArmazenamentoUseCase {
  constructor(
    private readonly areaRepository: AreaArmazenamentoRepository,
    private readonly cargaRepository: CargaQuimicaRepository,
  ) {}

  async execute(
    input: CadastrarAreaArmazenamentoInputDto,
  ): Promise<
    Either<CadastrarAreaArmazenamentoError, AreaArmazenamentoOutputDto>
  > {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const area = AreaArmazenamento.create({
      id: generateEntityId('ARM'),
      nome: input.nome,
      codigo: input.codigo,
      tipo: input.tipo,
      cargaQuimicaId: input.cargaQuimicaId,
      capacidadeMaxima: input.capacidadeMaxima,
      quantidadeOcupada: input.quantidadeOcupada,
    });
    if (area.kind === 'left') return area;

    const salva = await this.areaRepository.salvar(area.value);
    return right({ id: salva.id });
  }
}
