import { StatusValidacao } from '../../../domain/enums.js';
import {
  CargaNaoEncontradaError,
  DocumentoNaoEncontradoError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { ValidarDocumentacaoInputDto } from '../../dtos/carga-quimica.dto.js';

export type ValidarDocumentacaoError =
  | CargaNaoEncontradaError
  | DocumentoNaoEncontradoError;

export class ValidarDocumentacaoUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(
    input: ValidarDocumentacaoInputDto,
  ): Promise<Either<ValidarDocumentacaoError, void>> {
    const carga = await this.cargaRepository.buscarPorId(input.cargaQuimicaId);
    if (!carga) {
      return left(new CargaNaoEncontradaError(input.cargaQuimicaId));
    }

    const documento = carga.documentos.find((item) => item.id === input.documentoId);
    if (!documento) {
      return left(new DocumentoNaoEncontradoError(input.documentoId));
    }

    documento.statusValidacao = StatusValidacao.VALIDADO;
    await this.cargaRepository.salvar(carga);
    return right(undefined);
  }
}
