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

export type DadosCadastraisProdutoQuimico = Pick<
  ProdutoQuimicoProps,
  'nome' | 'descricao' | 'grupoCompatibilidade' | 'classificacaoRisco'
>;

export class ProdutoQuimico {
  public readonly id: string;
  public nome: string;
  public descricao: string;
  public grupoCompatibilidade: string;
  public classificacaoRisco: ClassificacaoRisco;
  public ativo: boolean;
  public readonly dataCadastro: Date;
  public dataAtualizacao: Date;

  private constructor(props: ProdutoQuimicoProps) {
    this.id = props.id;
    this.nome = props.nome.trim();
    this.descricao = props.descricao.trim();
    this.grupoCompatibilidade = props.grupoCompatibilidade.trim();
    this.classificacaoRisco = props.classificacaoRisco;
    this.ativo = props.ativo ?? true;
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? this.dataCadastro;
  }

  static create(
    props: ProdutoQuimicoProps,
  ): Either<ProdutoQuimicoInvalidoError, ProdutoQuimico> {
    if (!props.id) {
      return left(
        new ProdutoQuimicoInvalidoError(
          'Produto químico inválido: id é obrigatório.',
        ),
      );
    }

    const dadosCadastrais = ProdutoQuimico.validarDadosCadastrais(props);
    if (dadosCadastrais.kind === 'left') return dadosCadastrais;

    if (props.ativo !== undefined && typeof props.ativo !== 'boolean') {
      return left(
        new ProdutoQuimicoInvalidoError(
          'Status do produto químico inválido: ativo deve ser verdadeiro ou falso.',
        ),
      );
    }

    return right(new ProdutoQuimico(props));
  }

  atualizar(
    dados: DadosCadastraisProdutoQuimico,
  ): Either<ProdutoQuimicoInvalidoError, void> {
    const dadosCadastrais = ProdutoQuimico.validarDadosCadastrais(dados);
    if (dadosCadastrais.kind === 'left') return dadosCadastrais;

    this.nome = dados.nome.trim();
    this.descricao = dados.descricao.trim();
    this.grupoCompatibilidade = dados.grupoCompatibilidade.trim();
    this.classificacaoRisco = dados.classificacaoRisco;
    this.dataAtualizacao = new Date();
    return right(undefined);
  }

  inativar(): void {
    this.ativo = false;
    this.dataAtualizacao = new Date();
  }

  static validarDadosCadastrais(
    dados: DadosCadastraisProdutoQuimico,
  ): Either<ProdutoQuimicoInvalidoError, void> {
    if (
      !ProdutoQuimico.textoPreenchido(dados.nome) ||
      !ProdutoQuimico.textoPreenchido(dados.descricao)
    ) {
      return left(
        new ProdutoQuimicoInvalidoError(
          'Produto químico inválido: nome e descrição são obrigatórios.',
        ),
      );
    }

    if (!ProdutoQuimico.textoPreenchido(dados.grupoCompatibilidade)) {
      return left(
        new ProdutoQuimicoInvalidoError(
          'Produto químico inválido: grupo de compatibilidade é obrigatório.',
        ),
      );
    }

    if (!dados.classificacaoRisco) {
      return left(
        new ProdutoQuimicoInvalidoError(
          'Produto químico inválido: classificação de risco é obrigatória.',
        ),
      );
    }

    return right(undefined);
  }

  private static textoPreenchido(valor: unknown): valor is string {
    return typeof valor === 'string' && valor.trim().length > 0;
  }
}
