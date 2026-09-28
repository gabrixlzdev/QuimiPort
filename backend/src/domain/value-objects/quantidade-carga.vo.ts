import { UnidadeMedida } from '../enums.js';

export class QuantidadeCarga {
  public readonly valor: number;
  public readonly unidade: UnidadeMedida;

  constructor(valor: number, unidade: UnidadeMedida) {
    if (!Number.isFinite(valor) || valor <= 0) {
      throw new Error('Quantidade da carga deve ser maior que zero.');
    }

    if (!Object.values(UnidadeMedida).includes(unidade)) {
      throw new Error('Unidade de medida inválida para a carga.');
    }

    this.valor = valor;
    this.unidade = unidade;
  }
}
