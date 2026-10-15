import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import {
  ClassificacaoRiscoInvalidaError,
  ProdutoQuimicoDuplicadoError,
  ProdutoQuimicoInvalidoError,
} from '../../../domain/errors/produto-quimico.errors.js';
import { ClassificacaoRisco } from '../../../domain/value-objects/classificacao-risco.vo.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { Either, left, right } from '../../../shared/either.js';
import { generateEntityId } from '../../id-generator.js';
import {
  CadastrarProdutoInputDto,
  ProdutoQuimicoOutputDto,
} from '../../dtos/produto-quimico.dto.js';

export type CadastrarProdutoError =
  | ProdutoQuimicoDuplicadoError
  | ClassificacaoRiscoInvalidaError
  | ProdutoQuimicoInvalidoError;

export class CadastrarProdutoUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(
    input: CadastrarProdutoInputDto,
  ): Promise<Either<CadastrarProdutoError, ProdutoQuimicoOutputDto>> {
    const produtoExistente = await this.produtoRepository.buscarPorNomeEClasseRisco(
      input.nome,
      input.classeRisco,
    );
    if (produtoExistente) {
      return left(new ProdutoQuimicoDuplicadoError());
    }

    const classificacaoRisco = ClassificacaoRisco.create(
      input.classeRisco,
      input.subclasse,
      input.numeroONU,
      input.grupoEmbalagem,
    );
    if (classificacaoRisco.kind === 'left') return classificacaoRisco;

    const produto = ProdutoQuimico.create({
      id: generateEntityId('PRQ'),
      nome: input.nome,
      descricao: input.descricao,
      grupoCompatibilidade: input.grupoCompatibilidade,
      classificacaoRisco: classificacaoRisco.value,
      ativo: input.ativo ?? true,
    });
    if (produto.kind === 'left') return produto;

    const salvo = await this.produtoRepository.salvar(produto.value);

    return right({
      id: salvo.id,
      nome: salvo.nome,
      descricao: salvo.descricao,
      grupoCompatibilidade: salvo.grupoCompatibilidade,
      classeRisco: salvo.classificacaoRisco.classe,
      subclasse: salvo.classificacaoRisco.subclasse,
      numeroONU: salvo.classificacaoRisco.numeroONU,
      grupoEmbalagem: salvo.classificacaoRisco.grupoEmbalagem,
      ativo: salvo.ativo,
    });
  }
}
