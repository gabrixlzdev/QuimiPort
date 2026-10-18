import { ProdutoQuimicoNaoEncontradoError } from '../../../domain/errors/produto-quimico.errors.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { ProdutoQuimicoMapper } from '../../mappers/produto-quimico.mapper.js';
import { ProdutoQuimicoOutputDto } from '../../dtos/produto-quimico.dto.js';

export type BuscarProdutoError = ProdutoQuimicoNaoEncontradoError;

export class BuscarProdutoUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(
    id: string,
  ): Promise<Either<BuscarProdutoError, ProdutoQuimicoOutputDto>> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      return left(new ProdutoQuimicoNaoEncontradoError(id));
    }

    return right(ProdutoQuimicoMapper.toOutput(produto));
  }
}
