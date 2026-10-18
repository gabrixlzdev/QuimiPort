import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import {
  ClassificacaoRiscoInvalidaError,
  ProdutoQuimicoDuplicadoError,
  ProdutoQuimicoInvalidoError,
  ProdutoQuimicoNaoEncontradoError,
} from '../../../domain/errors/produto-quimico.errors.js';
import { ClassificacaoRisco } from '../../../domain/value-objects/classificacao-risco.vo.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { ProdutoQuimicoMapper } from '../../mappers/produto-quimico.mapper.js';
import {
  AtualizarProdutoInputDto,
  ProdutoQuimicoOutputDto,
} from '../../dtos/produto-quimico.dto.js';

export type AtualizarProdutoError =
  | ProdutoQuimicoNaoEncontradoError
  | ProdutoQuimicoDuplicadoError
  | ClassificacaoRiscoInvalidaError
  | ProdutoQuimicoInvalidoError;

export class AtualizarProdutoUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(
    id: string,
    input: AtualizarProdutoInputDto,
  ): Promise<Either<AtualizarProdutoError, ProdutoQuimicoOutputDto>> {
    const produto = await this.produtoRepository.buscarPorId(id);
    if (!produto) {
      return left(new ProdutoQuimicoNaoEncontradoError(id));
    }

    const classificacaoRisco = ClassificacaoRisco.create(
      input.classeRisco,
      input.subclasse,
      input.numeroONU,
      input.grupoEmbalagem,
    );
    if (classificacaoRisco.kind === 'left') return classificacaoRisco;

    const dados = {
      nome: input.nome,
      descricao: input.descricao,
      grupoCompatibilidade: input.grupoCompatibilidade,
      classificacaoRisco: classificacaoRisco.value,
    };
    const validacao = ProdutoQuimico.validarDadosCadastrais(dados);
    if (validacao.kind === 'left') return validacao;

    const produtoComMesmaIdentificacao =
      await this.produtoRepository.buscarPorNomeEClasseRisco(
        dados.nome.trim(),
        dados.classificacaoRisco.classe,
      );
    if (
      produtoComMesmaIdentificacao &&
      produtoComMesmaIdentificacao.id !== produto.id
    ) {
      return left(new ProdutoQuimicoDuplicadoError());
    }

    const atualizacao = produto.atualizar(dados);
    if (atualizacao.kind === 'left') return atualizacao;

    const salvo = await this.produtoRepository.salvar(produto);
    return right(ProdutoQuimicoMapper.toOutput(salvo));
  }
}
