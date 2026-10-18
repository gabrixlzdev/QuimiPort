import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { Either, right } from '../../../shared/either.js';
import { ProdutoQuimicoMapper } from '../../mappers/produto-quimico.mapper.js';
import { ProdutoQuimicoOutputDto } from '../../dtos/produto-quimico.dto.js';

export class ListarProdutosUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(): Promise<Either<never, ProdutoQuimicoOutputDto[]>> {
    const produtos = await this.produtoRepository.listar();
    return right(
      produtos.map((produto) => ProdutoQuimicoMapper.toOutput(produto)),
    );
  }
}
