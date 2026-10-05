export class RegistroProfissional {
  public readonly valor: string;

  private static readonly registroRegex = /^(CRQ|CREA)[\s-]?\d{3,7}$/i;
  private static readonly ufRegex = /^(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/i;

  public readonly ufConselho: string;

  constructor(registro: string, ufConselho: string) {
    if (!registro || !RegistroProfissional.registroRegex.test(registro)) {
      throw new Error('Registro profissional inválido. Use CRQ/CREA com 3 a 7 dígitos.');
    }

    if (!RegistroProfissional.ufRegex.test(ufConselho)) {
      throw new Error('UF do conselho inválida.');
    }

    this.valor = registro;
    this.ufConselho = ufConselho.toUpperCase();
  }
}
