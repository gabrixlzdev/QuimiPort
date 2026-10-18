import { Either, left, right } from '../../shared/either.js';
import { ClassificacaoRiscoInvalidaError } from '../errors/produto-quimico.errors.js';

export class ClassificacaoRisco {
  public readonly classe: string;
  public readonly subclasse: string;
  public readonly numeroONU: string;
  public readonly grupoEmbalagem: string;

  private constructor(classe: string, subclasse: string, numeroONU: string, grupoEmbalagem: string) {
    this.classe = classe;
    this.subclasse = subclasse;
    this.numeroONU = numeroONU;
    this.grupoEmbalagem = grupoEmbalagem;
  }

  static create(
    classe: string,
    subclasse: string,
    numeroONU: string,
    grupoEmbalagem: string,
  ): Either<ClassificacaoRiscoInvalidaError, ClassificacaoRisco> {
    if (!classe || classe.trim().length === 0) {
      return left(new ClassificacaoRiscoInvalidaError('Classe de risco é obrigatória.'));
    }

    if (!/^[0-9]{4}$/.test(numeroONU)) {
      return left(new ClassificacaoRiscoInvalidaError('Número ONU deve conter exatamente 4 dígitos.'));
    }

    return right(new ClassificacaoRisco(classe, subclasse, numeroONU, grupoEmbalagem));
  }
}
