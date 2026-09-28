export class Cpf {
  public readonly valor: string;

  constructor(valor: string) {
    if (!valor || !/^\d{11}$/.test(valor.replace(/\D/g, ''))) {
      throw new Error('CPF inválido.');
    }

    this.valor = valor.replace(/\D/g, '');
  }
}
