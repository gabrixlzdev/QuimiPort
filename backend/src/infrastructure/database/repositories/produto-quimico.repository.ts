import { Injectable } from '@nestjs/common';
import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';

@Injectable()
export class InMemoryProdutoQuimicoRepository implements ProdutoQuimicoRepository {
  private readonly produtos = new Map<string, ProdutoQuimico>();

  async salvar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
    this.produtos.set(produto.id, produto);
    return produto;
  }

  async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
    return this.produtos.get(id) ?? null;
  }

  async buscarPorNome(nome: string): Promise<ProdutoQuimico | null> {
    return (
      [...this.produtos.values()].find((produto) => produto.nome === nome) ?? null
    );
  }

  async buscarPorNomeEClasseRisco(
    nome: string,
    classeRisco: string,
  ): Promise<ProdutoQuimico | null> {
    return (
      [...this.produtos.values()].find(
        (produto) =>
          produto.nome === nome &&
          produto.classificacaoRisco.classe === classeRisco,
      ) ?? null
    );
  }

  async listar(): Promise<ProdutoQuimico[]> {
    return [...this.produtos.values()];
  }
}
