import { ProdutoQuimico } from '../entities/produto-quimico.entity.js';

export interface ProdutoQuimicoRepository {
  salvar(produto: ProdutoQuimico): Promise<ProdutoQuimico>;
  buscarPorId(id: string): Promise<ProdutoQuimico | null>;
  buscarPorNome(nome: string): Promise<ProdutoQuimico | null>;
  listar(): Promise<ProdutoQuimico[]>;
}
