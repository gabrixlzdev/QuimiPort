import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ConflitoError,
  DadosInvalidosError,
  DomainError,
  RecursoNaoEncontradoError,
} from '../../domain/errors/domain.error.js';

export function statusHttpDoErro(error: DomainError): HttpStatus {
  if (error instanceof DadosInvalidosError) return HttpStatus.BAD_REQUEST;
  if (error instanceof RecursoNaoEncontradoError) return HttpStatus.NOT_FOUND;
  if (error instanceof ConflitoError) return HttpStatus.CONFLICT;

  return HttpStatus.UNPROCESSABLE_ENTITY;
}

export function toHttpException(error: DomainError): HttpException {
  const statusCode = statusHttpDoErro(error);

  return new HttpException(
    { statusCode, erro: error.name, mensagem: error.message },
    statusCode,
  );
}
