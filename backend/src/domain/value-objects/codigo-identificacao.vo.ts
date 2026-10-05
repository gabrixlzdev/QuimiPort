export class CodigoIdentificacao {
  public readonly codigo: string;

  private static readonly regex = /^[A-Za-z0-9]{8,20}$/;

  constructor(codigo: string) {
    if (!codigo || !CodigoIdentificacao.regex.test(codigo)) {
      throw new Error('CodigoIdentificacao inválido: deve conter 8-20 caracteres alfanuméricos sem espaços.');
    }

    this.codigo = codigo;
  }
}
