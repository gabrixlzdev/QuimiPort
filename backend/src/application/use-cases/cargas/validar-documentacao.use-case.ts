import { StatusValidacao } from '../../../domain/enums.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { ValidarDocumentacaoInputDto } from '../../dtos/carga-quimica.dto.js';

export class ValidarDocumentacaoUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(input: ValidarDocumentacaoInputDto): Promise<void> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      throw new Error('Carga química não encontrada.');
    }

    const documento = carga.documentos.find((item) => item.id === input.documentoId);
    if (!documento) {
      throw new Error('Documento não encontrado para a carga.');
    }

    documento.statusValidacao = StatusValidacao.VALIDADO;
    await this.cargaRepository.salvar(carga);
  }
}
