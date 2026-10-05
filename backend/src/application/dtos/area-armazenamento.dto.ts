export type CadastrarAreaArmazenamentoInputDto = {
  nome: string;
  codigo: string;
  tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';
  cargaQuimicaId: string;
  capacidadeMaxima: number;
  quantidadeOcupada: number;
};

export type AreaArmazenamentoOutputDto = {
  id: string;
};
