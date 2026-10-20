import { describe, expect, it } from 'vitest';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../../domain/value-objects/codigo-identificacao.vo.js';
import { StatusCarga, UnidadeMedida } from '../../../domain/enums.js';
import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { getOrThrow } from '../../../shared/either.js';
import { ListarCargasUseCase } from './listar-cargas.use-case.js';
import { BuscarCargaUseCase } from './buscar-carga.use-case.js';

// getOrThrow é aceitável aqui: só monta dados de teste já válidos.
function criarCarga(id: string, codigo: string): CargaQuimicaAggregate {
  return getOrThrow(
    CargaQuimicaAggregate.create({
      id,
      codigoIdentificacao: getOrThrow(CodigoIdentificacao.create(codigo)),
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
}

describe('ListarCargasUseCase', () => {
  it('retorna lista vazia quando não há cargas', async () => {
    const useCase = new ListarCargasUseCase(
      new InMemoryCargaQuimicaRepository(),
    );

    const resultado = await useCase.execute();

    expect(resultado.kind).toBe('right');
    if (resultado.kind === 'right') {
      expect(resultado.value).toEqual([]);
    }
  });

  it('lista as cargas cadastradas no formato do DTO de saída', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    await repository.salvar(criarCarga('carga-1', 'ABC12345'));
    await repository.salvar(criarCarga('carga-2', 'XYZ98765'));
    const useCase = new ListarCargasUseCase(repository);

    const resultado = await useCase.execute();

    expect(resultado.kind).toBe('right');
    if (resultado.kind === 'right') {
      expect(resultado.value).toHaveLength(2);
      expect(resultado.value.map((c) => c.id)).toEqual(['carga-1', 'carga-2']);
      expect(resultado.value[0]).toMatchObject({
        codigoIdentificacao: 'ABC12345',
        quantidadeValor: 100,
        quantidadeUnidade: UnidadeMedida.QUILOGRAMAS,
        status: StatusCarga.REGISTRADA,
      });
    }
  });
});

describe('BuscarCargaUseCase', () => {
  it('busca carga por identificador', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    await repository.salvar(criarCarga('carga-1', 'ABC12345'));
    const useCase = new BuscarCargaUseCase(repository);

    const resultado = await useCase.execute('carga-1');

    expect(resultado.kind).toBe('right');
    if (resultado.kind === 'right') {
      expect(resultado.value.id).toBe('carga-1');
      expect(resultado.value.codigoIdentificacao).toBe('ABC12345');
      expect(resultado.value.status).toBe(StatusCarga.REGISTRADA);
    }
  });

  it('retorna CargaNaoEncontradaError para id inexistente', async () => {
    const useCase = new BuscarCargaUseCase(
      new InMemoryCargaQuimicaRepository(),
    );

    const resultado = await useCase.execute('carga-inexistente');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaNaoEncontradaError);
    }
  });
});
