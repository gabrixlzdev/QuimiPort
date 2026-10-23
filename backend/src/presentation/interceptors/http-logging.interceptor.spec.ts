import {
  CallHandler,
  ExecutionContext,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { HttpLoggingInterceptor } from './http-logging.interceptor.js';

function criarContextoHttp(
  method: string,
  originalUrl: string,
  statusCode: number,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, originalUrl }),
      getResponse: () => ({ statusCode }),
    }),
  } as unknown as ExecutionContext;
}

describe('HttpLoggingInterceptor', () => {
  it('deve registrar log de sucesso com método, rota e status HTTP', () => {
    const interceptor = new HttpLoggingInterceptor();
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const context = criarContextoHttp('POST', '/produtos-quimicos', 201);
    const next: CallHandler = { handle: () => of({ id: 'PRQ-1' }) };

    interceptor.intercept(context, next).subscribe();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^POST \/produtos-quimicos 201 - \d+ms$/),
    );
    logSpy.mockRestore();
  });

  it('deve registrar warn quando ocorrer erro de validação ou regra de negócio (4xx)', () => {
    const interceptor = new HttpLoggingInterceptor();
    const warnSpy = vi
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
    const context = criarContextoHttp('POST', '/cargas/CRQ-1/liberar', 422);
    const erroNegocio = new UnprocessableEntityException(
      'Carga não possui inspeção aprovada.',
    );
    const next: CallHandler = { handle: () => throwError(() => erroNegocio) };

    interceptor.intercept(context, next).subscribe({ error: () => {} });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^POST \/cargas\/CRQ-1\/liberar 422 - \d+ms \| Carga não possui inspeção aprovada\.$/,
      ),
    );
    warnSpy.mockRestore();
  });

  it('deve registrar error quando ocorrer falha interna inesperada (5xx)', () => {
    const interceptor = new HttpLoggingInterceptor();
    const errorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    const context = criarContextoHttp('POST', '/cargas', 500);
    const erroInterno = new Error('Falha de conexão com o banco de dados');
    const next: CallHandler = { handle: () => throwError(() => erroInterno) };

    interceptor.intercept(context, next).subscribe({ error: () => {} });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /^POST \/cargas 500 - \d+ms \| Falha de conexão com o banco de dados$/,
      ),
    );
    errorSpy.mockRestore();
  });
});
