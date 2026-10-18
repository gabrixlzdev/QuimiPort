import { Either, left, right } from '../../shared/either.js';
import { StatusAreaArmazenamento } from '../enums.js';
import {
  AreaArmazenamentoInvalidaError,
  CapacidadeExcedidaError,
} from '../errors/area-armazenamento.errors.js';

export type AreaArmazenamentoProps = {
  id: string;
  nome: string;
  codigo: string;
  tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';
  cargaQuimicaId: string;
  capacidadeMaxima: number;
  quantidadeOcupada: number;
};

export class AreaArmazenamento {
  public readonly id: string;
  public readonly nome: string;
  public readonly codigo: string;
  public readonly tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';
  public readonly cargaQuimicaId: string;
  public readonly capacidadeMaxima: number;
  public readonly quantidadeOcupada: number;
  public readonly status: StatusAreaArmazenamento;

  private constructor(props: AreaArmazenamentoProps) {
    this.id = props.id;
    this.nome = props.nome.trim();
    this.codigo = props.codigo.trim();
    this.tipo = props.tipo;
    this.cargaQuimicaId = props.cargaQuimicaId;
    this.capacidadeMaxima = props.capacidadeMaxima;
    this.quantidadeOcupada = props.quantidadeOcupada;
    this.status =
      this.quantidadeOcupada === this.capacidadeMaxima
        ? StatusAreaArmazenamento.LOTADA
        : StatusAreaArmazenamento.COM_ESPACO;
  }

  static create(
    props: AreaArmazenamentoProps,
  ): Either<
    AreaArmazenamentoInvalidaError | CapacidadeExcedidaError,
    AreaArmazenamento
  > {
    if (!props.id || !props.nome || !props.codigo) {
      return left(
        new AreaArmazenamentoInvalidaError('Área de armazenamento inválida.'),
      );
    }

    if (!props.cargaQuimicaId?.trim()) {
      return left(
        new AreaArmazenamentoInvalidaError(
          'Área de armazenamento deve estar associada a uma carga química.',
        ),
      );
    }

    if (
      !Number.isFinite(props.capacidadeMaxima) ||
      props.capacidadeMaxima <= 0
    ) {
      return left(
        new AreaArmazenamentoInvalidaError(
          'Capacidade máxima deve ser maior que zero.',
        ),
      );
    }

    if (
      !Number.isFinite(props.quantidadeOcupada) ||
      props.quantidadeOcupada <= 0
    ) {
      return left(
        new AreaArmazenamentoInvalidaError(
          'Quantidade ocupada deve ser maior que zero.',
        ),
      );
    }

    if (props.quantidadeOcupada > props.capacidadeMaxima) {
      return left(new CapacidadeExcedidaError());
    }

    return right(new AreaArmazenamento(props));
  }
}
