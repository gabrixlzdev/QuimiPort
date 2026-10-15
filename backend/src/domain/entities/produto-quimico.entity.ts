import { Either, left, right } from '../../shared/either.js';
import { ProdutoQuimicoInvalidoError } from '../errors/produto-quimico.errors.js';
import { ClassificacaoRisco } from '../value-objects/classificacao-risco.vo.js';

export type ProdutoQuimicoProps = {
  id: string;
  nome: string;
  descricao: string;
  grupoCompatibilidade: string;
  classificacaoRisco: ClassificacaoRisco;
  ativo?: boolean;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
};

export class ProdutoQuimico {
  public readonly id: string;
  public readonly nome: string;
  public readonly descricao: string;
  public readonly grupoCompatibilidade: string;
  public readonly classificacaoRisco: ClassificacaoRisco;
  public ativo: boolean;
  public readonly dataCadastro: Date;
  public dataAtualizacao: Date;

  private constructor(props: ProdutoQuimicoProps) {
    this.id = props.id;
    this.nome = props.nome.trim();
    this.descricao = props.descricao.trim();
    this.grupoCompatibilidade = props.grupoCompatibilidade;
    this.classificacaoRisco = props.classificacaoRisco;
    this.ativo = props.ativo ?? true;
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? this.dataCadastro;
  }

  static create(props: ProdutoQuimicoProps): Either<ProdutoQuimicoInvalidoError, ProdutoQuimico> {
    if (!props.id || !props.nome || !props.descricao) {
      return left(new ProdutoQuimicoInvalidoError('Produto químico inválido: id, nome e descrição são obrigatórios.'));
    }

    if (!props.classificacaoRisco) {
      return left(new ProdutoQuimicoInvalidoError('Produto químico inválido: classificação de risco é obrigatória.'));
    }

    return right(new ProdutoQuimico(props));
  }

  inativar(): void {
    this.ativo = false;
    this.dataAtualizacao = new Date();
  }
}
