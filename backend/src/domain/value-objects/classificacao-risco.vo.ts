export class ClassificacaoRisco {
  public readonly classe: string;
  public readonly subclasse: string;
  public readonly numeroONU: string;
  public readonly grupoEmbalagem: string;

  constructor(classe: string, subclasse: string, numeroONU: string, grupoEmbalagem: string) {
    if (!classe || classe.trim().length === 0) {
      throw new Error('Classe de risco é obrigatória.');
    }

    if (!/^[0-9]{4}$/.test(numeroONU)) {
      throw new Error('Número ONU deve conter exatamente 4 dígitos.');
    }

    this.classe = classe;
    this.subclasse = subclasse;
    this.numeroONU = numeroONU;
    this.grupoEmbalagem = grupoEmbalagem;
  }
}
