import { StatusCarga, UnidadeMedida } from '../../domain/enums.js';

export type RegistrarCargaInputDto = {
  codigoIdentificacao: string;
  produtoQuimicoId: string;
  quantidadeValor: number;
  quantidadeUnidade: UnidadeMedida;
  responsavelTecnicoId: string;
  origem: string;
  destino: string;
  dataEntrada: Date;
  grupoCompatibilidade: string;
};

export type CargaQuimicaOutputDto = {
  id: string;
  codigoIdentificacao: string;
  produtoQuimicoId: string;
  quantidadeValor: number;
  quantidadeUnidade: UnidadeMedida;
  responsavelTecnicoId: string;
  origem: string;
  destino: string;
  dataEntrada: Date;
  grupoCompatibilidade: string;
  status: StatusCarga;
};

export type ValidarDocumentacaoInputDto = {
  cargaQuimicaId: string;
  documentoId: string;
};

export type RealizarInspecaoInputDto = {
  cargaQuimicaId: string;
  id?: string;
  dataSolicitacao: Date;
  dataRealizacao: Date;
  inspetorId: string;
  resultado: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
  observacoes?: string;
};

export type LiberarCargaInputDto = {
  cargaQuimicaId: string;
  justificativa: string;
};

export type BloquearCargaInputDto = {
  cargaQuimicaId: string;
  motivo: string;
};
