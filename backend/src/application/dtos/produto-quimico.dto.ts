export type CadastrarProdutoInputDto = {
  id?: string;
  nome: string;
  descricao: string;
  grupoCompatibilidade: string;
  classeRisco: string;
  subclasse: string;
  numeroONU: string;
  grupoEmbalagem: string;
  ativo?: boolean;
};

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
};
