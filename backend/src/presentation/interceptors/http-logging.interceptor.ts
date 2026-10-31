import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * Interceptor global de observabilidade HTTP.
 * Registra todas as requisições recebidas (criação de produtos, registro de cargas,
 * alterações de status, bloqueios e liberações), o tempo de resposta em ms e
 * diferencia falhas de validação/negócio (4xx -> WARN) de erros internos (5xx -> ERROR).
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, originalUrl } = request;

    const inicio = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duracaoMs = Date.now() - inicio;
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} - ${duracaoMs}ms`,
          );
        },
        error: (erro: unknown) => {
          const duracaoMs = Date.now() - inicio;
          const status =
            erro instanceof HttpException
              ? erro.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;

          const mensagem =
            erro instanceof Error ? erro.message : 'Erro interno inesperado';

          if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
              `${method} ${originalUrl} ${status} - ${duracaoMs}ms | ${mensagem}`,
            );
          } else {
            this.logger.warn(
              `${method} ${originalUrl} ${status} - ${duracaoMs}ms | ${mensagem}`,
            );
          }
        },
      }),
    );
  }
}
