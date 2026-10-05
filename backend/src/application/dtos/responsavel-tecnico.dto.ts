export type CadastrarResponsavelTecnicoInputDto = {
  nome: string;
  cpf: string;
  registroProfissional: string;
  ufConselho: string;
  emailContato?: string;
};

export type ResponsavelTecnicoOutputDto = {
  id: string;
};
