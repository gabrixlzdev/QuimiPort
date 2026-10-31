import { describe, expect, it } from 'vitest';
import { ResultadoInspecao } from '../enums.js';
import { Inspecao } from './inspecao.entity.js';
import { InspecaoInvalidaError } from '../errors/carga-quimica.errors.js';

describe('Inspecao', () => {
  const props = () => ({
    id: 'inspecao-1',
    dataSolicitacao: new Date('2026-10-22T09:00:00.000Z'),
    dataRealizacao: new Date('2026-10-27T10:30:00.000Z'),
    inspetorId: 'inspetor-1',
    resultado: ResultadoInspecao.APROVADO,
  });

  it('rejeita data de solicitação inválida', () => {
    const resultado = Inspecao.create({
      ...props(),
      dataSolicitacao: new Date('inválida'),
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(InspecaoInvalidaError);
      expect(resultado.error.message).toBe(
        'Data de solicitação da inspeção inválida.',
      );
    }
  });

  it('rejeita data de realização inválida', () => {
    const resultado = Inspecao.create({
      ...props(),
      dataRealizacao: new Date('inválida'),
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(InspecaoInvalidaError);
      expect(resultado.error.message).toBe(
        'Data de realização da inspeção inválida.',
      );
    }
  });
});
