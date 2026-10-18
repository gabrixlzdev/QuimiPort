import { ProdutoQuimico } from '../../domain/entities/produto-quimico.entity.js';
import { ProdutoQuimicoOutputDto } from '../dtos/produto-quimico.dto.js';

export class ProdutoQuimicoMapper {
  static toOutput(produto: ProdutoQuimico): ProdutoQuimicoOutputDto {
    return {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      grupoCompatibilidade: produto.grupoCompatibilidade,
      classeRisco: produto.classificacaoRisco.classe,
      subclasse: produto.classificacaoRisco.subclasse,
      numeroONU: produto.classificacaoRisco.numeroONU,
      grupoEmbalagem: produto.classificacaoRisco.grupoEmbalagem,
      ativo: produto.ativo,
      dataCadastro: produto.dataCadastro,
      dataAtualizacao: produto.dataAtualizacao,
    };
  }
}
