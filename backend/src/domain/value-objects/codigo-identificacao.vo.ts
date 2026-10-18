import { Either, left, right } from '../../shared/either.js';
import { CodigoIdentificacaoInvalidoError } from '../errors/carga-quimica.errors.js';

export class CodigoIdentificacao {
  public readonly codigo: string;

  private static readonly regex = /^[A-Za-z0-9]{8,20}$/;

  private constructor(codigo: string) {
    this.codigo = codigo;
  }

  static create(codigo: string): Either<CodigoIdentificacaoInvalidoError, CodigoIdentificacao> {
    if (!codigo || !CodigoIdentificacao.regex.test(codigo)) {
      return left(new CodigoIdentificacaoInvalidoError());
    }

    return right(new CodigoIdentificacao(codigo));
  }
}
