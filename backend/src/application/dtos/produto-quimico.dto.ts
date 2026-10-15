export type CadastrarProdutoInputDto = {
  nome: string;
  descricao: string;
  grupoCompatibilidade: string;
  classeRisco: string;
  subclasse: string;
  numeroONU: string;
  grupoEmbalagem: string;
  ativo?: boolean;
};

export type AtualizarProdutoInputDto = Omit<CadastrarProdutoInputDto, 'ativo'>;

export type ProdutoQuimicoOutputDto = {
  id: string;
  nome: string;
  descricao: string;
  grupoCompatibilidade: string;
  classeRisco: string;
  subclasse: string;
  numeroONU: string;
  grupoEmbalagem: string;
  ativo: boolean;
  dataCadastro: Date;
  dataAtualizacao: Date;
};
