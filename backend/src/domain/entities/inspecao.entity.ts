import { ResultadoInspecao } from '../enums.js';

export type InspecaoProps = {
  id: string;
  dataSolicitacao: Date;
  dataRealizacao: Date;
  inspetorId: string;
  resultado: ResultadoInspecao;
  observacoes?: string;
};

export class Inspecao {
  public readonly id: string;
  public readonly dataSolicitacao: Date;
  public readonly dataRealizacao: Date;
  public readonly inspetorId: string;
  public readonly resultado: ResultadoInspecao;
  public readonly observacoes: string;

  constructor(props: InspecaoProps) {
    if (!props.id || !props.inspetorId) {
      throw new Error('Inspeção deve possuir id e inspetor válidos.');
    }

    if (!(props.dataRealizacao instanceof Date) || Number.isNaN(props.dataRealizacao.getTime())) {
      throw new Error('Data de realização da inspeção inválida.');
    }

    if (!Object.values(ResultadoInspecao).includes(props.resultado)) {
      throw new Error('Resultado da inspeção inválido.');
    }

    this.id = props.id;
    this.dataSolicitacao = props.dataSolicitacao;
    this.dataRealizacao = props.dataRealizacao;
    this.inspetorId = props.inspetorId;
    this.resultado = props.resultado;
    this.observacoes = props.observacoes ?? '';
  }
}
