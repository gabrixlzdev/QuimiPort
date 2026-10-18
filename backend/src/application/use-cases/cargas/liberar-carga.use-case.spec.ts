import { describe, expect, it, vi } from 'vitest';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../../domain/value-objects/codigo-identificacao.vo.js';
import { StatusCarga, UnidadeMedida } from '../../../domain/enums.js';
import {
  CargaNaoEncontradaError,
  DocumentoObrigatorioAusenteError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { getOrThrow } from '../../../shared/either.js';
import { LiberarCargaUseCase } from './liberar-carga.use-case.js';

describe('LiberarCargaUseCase', () => {
  it('retorna CargaNaoEncontradaError quando a carga não existe', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const useCase = new LiberarCargaUseCase(repository);

    const resultado = await useCase.execute({
      cargaQuimicaId: 'carga-inexistente',
      justificativa: 'Liberação.',
      responsavelId: 'gestor-1',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaNaoEncontradaError);
    }
  });

  it('propaga o erro do agregado e não persiste carga sem documentação', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const carga = getOrThrow(
      CargaQuimicaAggregate.create({
        id: 'carga-1',
        codigoIdentificacao: getOrThrow(CodigoIdentificacao.create('ABC12345')),
        produtoQuimicoId: 'produto-1',
        quantidade: getOrThrow(
          QuantidadeCarga.create(100, UnidadeMedida.QUILOGRAMAS),
        ),
        responsavelTecnicoId: 'responsavel-1',
        origem: 'Santos',
        destino: 'Rio',
        dataEntrada: new Date('2026-01-01T00:00:00Z'),
        grupoCompatibilidade: 'CLASSE_8',
      }),
    );
    await repository.salvar(carga);
    const salvar = vi.spyOn(repository, 'salvar');
    const useCase = new LiberarCargaUseCase(repository);

    const resultado = await useCase.execute({
      cargaQuimicaId: carga.id,
      justificativa: 'Liberação.',
      responsavelId: 'gestor-1',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoObrigatorioAusenteError);
    }
    expect(salvar).not.toHaveBeenCalled();
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
  });
});
