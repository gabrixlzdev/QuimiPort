import { RegistroInspecaoError } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { ResultadoInspecao } from '../../../domain/enums.js';
import { Inspecao } from '../../../domain/entities/inspecao.entity.js';
import {
  CargaNaoEncontradaError,
  InspecaoInvalidaError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { generateEntityId } from '../../id-generator.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { RealizarInspecaoInputDto } from '../../dtos/carga-quimica.dto.js';

export type RealizarInspecaoError =
  CargaNaoEncontradaError | InspecaoInvalidaError | RegistroInspecaoError;

export class RealizarInspecaoUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: RealizarInspecaoInputDto,
  ): Promise<Either<RealizarInspecaoError, void>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const inspecao = Inspecao.create({
      id: generateEntityId('INS'),
      dataSolicitacao: input.dataSolicitacao,
      dataRealizacao: input.dataRealizacao,
      inspetorId: input.inspetorId,
      resultado: ResultadoInspecao[input.resultado],
      observacoes: input.observacoes,
    });
    if (inspecao.kind === 'left') return inspecao;

    const registro = carga.registrarInspecao(inspecao.value);
    if (registro.kind === 'left') return registro;

    await this.cargaRepository.salvar(carga);
    return right(undefined);
  }
}
