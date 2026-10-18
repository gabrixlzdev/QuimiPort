import { ProdutoQuimicoNaoEncontradoError } from '../../../domain/errors/produto-quimico.errors.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';

export type InativarProdutoError = ProdutoQuimicoNaoEncontradoError;

export class InativarProdutoUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(id: string): Promise<Either<InativarProdutoError, void>> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      return left(new ProdutoQuimicoNaoEncontradoError(id));
    }

    produto.inativar();
    await this.produtoRepository.salvar(produto);
    return right(undefined);
  }
}
