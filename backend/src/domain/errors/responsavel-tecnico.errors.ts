import {
  DadosInvalidosError,
  RecursoNaoEncontradoError,
} from './domain.error.js';

export class ResponsavelTecnicoInvalidoError extends DadosInvalidosError {
  constructor() {
    super('Responsável técnico inválido.');
  }
}

export class CPFInvalidoError extends DadosInvalidosError {
  constructor() {
    super('CPF inválido.');
  }
}

export class RegistroProfissionalInvalidoError extends DadosInvalidosError {}

export class ResponsavelTecnicoNaoEncontradoError extends RecursoNaoEncontradoError {
  constructor(public readonly responsavelTecnicoId: string) {
    super('Responsável técnico não encontrado.');
  }
}
