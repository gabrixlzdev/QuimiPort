import { Either, left, right } from '../../shared/either.js';
import { UnidadeMedida } from '../enums.js';
import {
  QuantidadeInvalidaError,
  UnidadeMedidaInvalidaError,
} from '../errors/carga-quimica.errors.js';

export class QuantidadeCarga {
  public readonly valor: number;
  public readonly unidade: UnidadeMedida;

  private constructor(valor: number, unidade: UnidadeMedida) {
    this.valor = valor;
    this.unidade = unidade;
  }

  static create(
    valor: number,
    unidade: UnidadeMedida,
  ): Either<
    QuantidadeInvalidaError | UnidadeMedidaInvalidaError,
    QuantidadeCarga
  > {
    if (!Number.isFinite(valor) || valor <= 0) {
      return left(new QuantidadeInvalidaError());
    }

    if (!Object.values(UnidadeMedida).includes(unidade)) {
      return left(new UnidadeMedidaInvalidaError());
    }

    return right(new QuantidadeCarga(valor, unidade));
  }
}
