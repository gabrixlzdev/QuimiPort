import { Either, left, right } from '../../shared/either.js';
import { ResultadoInspecao } from '../enums.js';
import { InspecaoInvalidaError } from '../errors/carga-quimica.errors.js';

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

  private constructor(props: InspecaoProps) {
    this.id = props.id;
    this.dataSolicitacao = props.dataSolicitacao;
    this.dataRealizacao = props.dataRealizacao;
    this.inspetorId = props.inspetorId;
    this.resultado = props.resultado;
    this.observacoes = props.observacoes ?? '';
  }

  static create(props: InspecaoProps): Either<InspecaoInvalidaError, Inspecao> {
    if (!props.id || !props.inspetorId) {
      return left(new InspecaoInvalidaError('Inspeção deve possuir id e inspetor válidos.'));
    }

    if (!(props.dataRealizacao instanceof Date) || Number.isNaN(props.dataRealizacao.getTime())) {
      return left(new InspecaoInvalidaError('Data de realização da inspeção inválida.'));
    }

    if (!Object.values(ResultadoInspecao).includes(props.resultado)) {
      return left(new InspecaoInvalidaError('Resultado da inspeção inválido.'));
    }

    return right(new Inspecao(props));
  }
}
