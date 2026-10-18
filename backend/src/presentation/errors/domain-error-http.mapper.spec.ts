import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { StatusCarga } from '../../domain/enums.js';
import {
  CargaBloqueadaError,
  CargaNaoEncontradaError,
  QuantidadeInvalidaError,
  TransicaoStatusInvalidaError,
} from '../../domain/errors/carga-quimica.errors.js';
import { ProdutoQuimicoDuplicadoError } from '../../domain/errors/produto-quimico.errors.js';
import {
  statusHttpDoErro,
  toHttpException,
} from './domain-error-http.mapper.js';

describe('DomainErrorHttpMapper', () => {
  it.each([
    [new QuantidadeInvalidaError(), HttpStatus.BAD_REQUEST],
    [new CargaNaoEncontradaError('carga-1'), HttpStatus.NOT_FOUND],
    [new ProdutoQuimicoDuplicadoError(), HttpStatus.CONFLICT],
    [new CargaBloqueadaError(), HttpStatus.UNPROCESSABLE_ENTITY],
  ])('mapeia %s para o status HTTP %i', (erro, status) => {
    expect(statusHttpDoErro(erro)).toBe(status);
  });

  it('converte o erro de domínio em resposta sem expor detalhes internos', () => {
    const excecao = toHttpException(
      new TransicaoStatusInvalidaError(
        StatusCarga.REGISTRADA,
        StatusCarga.FINALIZADA,
      ),
    );

    expect(excecao.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(excecao.getResponse()).toEqual({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      erro: 'TransicaoStatusInvalidaError',
      mensagem: 'Transição de status inválida: REGISTRADA -> FINALIZADA.',
    });
  });
});
