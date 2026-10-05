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

  constructor(props: ProdutoQuimicoProps) {
    if (!props.id || !props.nome || !props.descricao) {
      throw new Error('Produto químico inválido: id, nome e descrição são obrigatórios.');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.descricao = props.descricao.trim();
    this.grupoCompatibilidade = props.grupoCompatibilidade;
    this.classificacaoRisco = props.classificacaoRisco;
    this.ativo = props.ativo ?? true;
    this.dataCadastro = props.dataCadastro ?? new Date();
    this.dataAtualizacao = props.dataAtualizacao ?? this.dataCadastro;
  }

  inativar(): void {
    this.ativo = false;
    this.dataAtualizacao = new Date();
  }
}
