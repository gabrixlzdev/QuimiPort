import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';

export class InativarProdutoUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(id: string): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      throw new Error('Produto químico não encontrado.');
    }

    produto.inativar();
    await this.produtoRepository.salvar(produto);
  }
}
