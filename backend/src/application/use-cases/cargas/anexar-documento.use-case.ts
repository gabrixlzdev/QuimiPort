import { DocumentoCarga } from '../../../domain/aggregate/carga-quimica/documento-carga.entity.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { generateEntityId } from '../../id-generator.js';
import {
  AnexarDocumentoInputDto,
  DocumentoCargaOutputDto,
} from '../../dtos/carga-quimica.dto.js';

export class AnexarDocumentoUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: AnexarDocumentoInputDto,
  ): Promise<DocumentoCargaOutputDto> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      throw new Error('Carga química não encontrada.');
    }

    const documento = new DocumentoCarga({
      id: generateEntityId('DOC'),
      tipoDocumento: input.tipoDocumento,
      numeroReferencia: input.numeroReferencia,
      urlArquivo: input.urlArquivo,
      dataEmissao: new Date(input.dataEmissao),
      dataValidade: new Date(input.dataValidade),
    });

    carga.anexarDocumento(documento);
    await this.cargaRepository.salvar(carga);
    return { id: documento.id };
  }
}
