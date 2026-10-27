import { describe, expect, it, vi } from 'vitest';
import { CargasController } from './cargas.controller.js';
import { RealizarInspecaoUseCase } from '../../application/use-cases/inspecoes/realizar-inspecao.use-case.js';
import { right } from '../../shared/either.js';

describe('CargasController', () => {
  it('converte as datas ISO da inspeção em objetos Date antes de chamar o caso de uso', async () => {
    const execute = vi.fn().mockResolvedValue(right(undefined));
    const controller = new CargasController(
      undefined!,
      undefined!,
      { execute } as unknown as RealizarInspecaoUseCase,
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined!,
    );

    await controller.registrarInspecao('carga-1', {
      dataSolicitacao: '2026-10-22T09:00:00.000Z',
      dataRealizacao: '2026-10-27T10:30:00.000Z',
      inspetorId: 'inspetor-1',
      resultado: 'APROVADO',
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({
        cargaQuimicaId: 'carga-1',
        dataSolicitacao: new Date('2026-10-22T09:00:00.000Z'),
        dataRealizacao: new Date('2026-10-27T10:30:00.000Z'),
      }),
    );
    const [input] = execute.mock.calls[0];
    expect(input.dataSolicitacao).toBeInstanceOf(Date);
    expect(input.dataRealizacao).toBeInstanceOf(Date);
  });
});
