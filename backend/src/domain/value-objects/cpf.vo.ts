export class Cpf {
  public readonly valor: string;

  constructor(valor: string) {
    const digitos = (valor ?? '').replace(/\D/g, '');

    if (!Cpf.temEstruturaValida(digitos) || !Cpf.temDigitosVerificadoresValidos(digitos)) {
      throw new Error('CPF inválido.');
    }

    this.valor = digitos;
  }

  mascarado(): string {
    return `***.***.${this.valor.slice(6, 9)}-${this.valor.slice(9, 11)}`;
  }

  toString(): string {
    return this.mascarado();
  }

  toJSON(): string {
    return this.mascarado();
  }

  private static temEstruturaValida(digitos: string): boolean {
    return /^\d{11}$/.test(digitos) && !/^(\d)\1{10}$/.test(digitos);
  }

  private static temDigitosVerificadoresValidos(digitos: string): boolean {
    const calcularDigito = (base: string): number => {
      let soma = 0;
      let peso = base.length + 1;
      for (const caractere of base) {
        soma += Number(caractere) * peso;
        peso -= 1;
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeirosNoveDigitos = digitos.slice(0, 9);
    const primeiroDigitoVerificador = calcularDigito(primeirosNoveDigitos);
    const segundoDigitoVerificador = calcularDigito(primeirosNoveDigitos + primeiroDigitoVerificador);

    return digitos === `${primeirosNoveDigitos}${primeiroDigitoVerificador}${segundoDigitoVerificador}`;
  }
}
