import { AnexoDocumentoError } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { DocumentoCarga } from '../../../domain/aggregate/carga-quimica/documento-carga.entity.js';
import {
  CargaNaoEncontradaError,
  DocumentoCargaInvalidoError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { generateEntityId } from '../../id-generator.js';
import {
  AnexarDocumentoInputDto,
  DocumentoCargaOutputDto,
} from '../../dtos/carga-quimica.dto.js';

export type AnexarDocumentoError =
  CargaNaoEncontradaError | DocumentoCargaInvalidoError | AnexoDocumentoError;

export class AnexarDocumentoUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: AnexarDocumentoInputDto,
  ): Promise<Either<AnexarDocumentoError, DocumentoCargaOutputDto>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const documento = DocumentoCarga.create({
      id: generateEntityId('DOC'),
      tipoDocumento: input.tipoDocumento,
      numeroReferencia: input.numeroReferencia,
      urlArquivo: input.urlArquivo,
      dataEmissao: new Date(input.dataEmissao),
      dataValidade: new Date(input.dataValidade),
    });
    if (documento.kind === 'left') return documento;

    const anexado = carga.anexarDocumento(documento.value);
    if (anexado.kind === 'left') return anexado;

    await this.cargaRepository.salvar(carga);
    return right({ id: documento.value.id });
  }
}
