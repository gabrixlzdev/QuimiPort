import {
  ConflitoError,
  DadosInvalidosError,
  RecursoNaoEncontradoError,
} from './domain.error.js';

export class ProdutoQuimicoInvalidoError extends DadosInvalidosError {}

export class ClassificacaoRiscoInvalidaError extends DadosInvalidosError {}

export class ProdutoQuimicoDuplicadoError extends ConflitoError {
  constructor() {
    super('Produto químico já cadastrado com esse nome e classe de risco.');
  }
}

export class ProdutoQuimicoNaoEncontradoError extends RecursoNaoEncontradoError {
  constructor(public readonly produtoQuimicoId: string) {
    super('Produto químico não encontrado.');
  }
}
