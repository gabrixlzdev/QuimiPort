import { DadosInvalidosError, RegraNegocioError } from './domain.error.js';

export class AreaArmazenamentoInvalidaError extends DadosInvalidosError {}

export class CapacidadeExcedidaError extends RegraNegocioError {
  constructor() {
    super('Quantidade ocupada não pode exceder a capacidade máxima da área.');
  }
}
