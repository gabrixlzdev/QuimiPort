export abstract class DomainError {
  public readonly name: string;

  constructor(public readonly message: string) {
    this.name = new.target.name;
  }
}

export abstract class DadosInvalidosError extends DomainError {}

export abstract class RegraNegocioError extends DomainError {}

export abstract class RecursoNaoEncontradoError extends DomainError {}

export abstract class ConflitoError extends DomainError {}
