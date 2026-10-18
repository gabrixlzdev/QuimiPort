import { Either, left, right } from '../../shared/either.js';
import { RegistroProfissionalInvalidoError } from '../errors/responsavel-tecnico.errors.js';

export class RegistroProfissional {
  public readonly valor: string;

  private static readonly registroRegex = /^(CRQ|CREA)[\s-]?\d{3,7}$/i;
  private static readonly ufRegex = /^(?:AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/i;

  public readonly ufConselho: string;

  private constructor(registro: string, ufConselho: string) {
    this.valor = registro;
    this.ufConselho = ufConselho.toUpperCase();
  }

  static create(registro: string, ufConselho: string): Either<RegistroProfissionalInvalidoError, RegistroProfissional> {
    if (!registro || !RegistroProfissional.registroRegex.test(registro)) {
      return left(new RegistroProfissionalInvalidoError('Registro profissional inválido. Use CRQ/CREA com 3 a 7 dígitos.'));
    }

    if (!RegistroProfissional.ufRegex.test(ufConselho)) {
      return left(new RegistroProfissionalInvalidoError('UF do conselho inválida.'));
    }

    return right(new RegistroProfissional(registro, ufConselho));
  }
}
