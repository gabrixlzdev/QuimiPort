import { describe, expect, it, vi } from 'vitest';
import type { DataSource, EntityManager } from 'typeorm';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../../domain/value-objects/codigo-identificacao.vo.js';
import { StatusCarga, UnidadeMedida } from '../../../domain/enums.js';
import { CargaQuimicaOrmEntity } from '../entities/carga-quimica.orm-entity.js';
import { TypeOrmCargaQuimicaRepository } from './typeorm-carga-quimica.repository.js';
import { getOrThrow } from '../../../shared/either.js';

describe('TypeOrmCargaQuimicaRepository', () => {
  it('persiste e reidrata a data de criação e a trilha de auditoria', async () => {
    let entityPersistida: CargaQuimicaOrmEntity | undefined;
    const manager = {
      save: vi.fn(async (_entityClass, entity: CargaQuimicaOrmEntity) => {
        entityPersistida = entity;
        return entity;
      }),
    };
    const repository = {
      findOne: vi.fn(async () => entityPersistida ?? null),
      find: vi.fn(async () => (entityPersistida ? [entityPersistida] : [])),
    };
    const dataSource = {
      transaction: vi.fn(
        async (operacao: (manager: EntityManager) => Promise<void>) =>
          operacao(manager as unknown as EntityManager),
      ),
      getRepository: vi.fn(() => repository),
    } as unknown as DataSource;

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
        dataCriacao: new Date('2025-12-31T23:00:00Z'),
        grupoCompatibilidade: 'CLASSE_8',
        autorizacaoSuperiorId: 'gestor-superior-1',
      }),
    );
    getOrThrow(
      carga.changeStatus(
        StatusCarga.CANCELADA,
        'operador-1',
        'Cancelamento solicitado.',
        new Date('2026-01-02T00:00:00Z'),
      ),
    );

    const cargaRepository = new TypeOrmCargaQuimicaRepository(dataSource);
    await cargaRepository.salvar(carga);

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(manager.save).toHaveBeenCalledOnce();
    expect(entityPersistida?.dataCriacao).toEqual(carga.dataCriacao);
    expect(entityPersistida?.codigoIdentificacao).toBe('ABC12345');
    expect(entityPersistida?.autorizacaoSuperiorId).toBe('gestor-superior-1');
    expect(entityPersistida?.historicoStatus).toHaveLength(2);
    expect(entityPersistida?.historicoStatus[1]).toMatchObject({
      id: 'carga-1-status-1',
      sequencia: 1,
      statusAnterior: StatusCarga.REGISTRADA,
      statusNovo: StatusCarga.CANCELADA,
      responsavelId: 'operador-1',
      motivo: 'Cancelamento solicitado.',
    });

    const recuperada = await cargaRepository.buscarPorId(carga.id);

    expect(recuperada?.status).toBe(StatusCarga.CANCELADA);
    expect(recuperada?.codigoIdentificacao).toEqual(
      getOrThrow(CodigoIdentificacao.create('ABC12345')),
    );
    expect(recuperada?.dataCriacao).toEqual(carga.dataCriacao);
    expect(recuperada?.autorizacaoSuperiorId).toBe('gestor-superior-1');
    expect(recuperada?.historicoStatus).toEqual(carga.historicoStatus);
  });

  it('converte a quantidade numeric retornada como texto pelo driver do postgres', async () => {
    const carga = getOrThrow(
      CargaQuimicaAggregate.create({
        id: 'carga-2',
        codigoIdentificacao: getOrThrow(CodigoIdentificacao.create('XYZ98765')),
        produtoQuimicoId: 'produto-1',
        quantidade: getOrThrow(
          QuantidadeCarga.create(250.5, UnidadeMedida.TONELADAS),
        ),
        responsavelTecnicoId: 'responsavel-1',
        origem: 'Santos',
        destino: 'Cubatão',
        dataEntrada: new Date('2026-01-01T00:00:00Z'),
        dataCriacao: new Date('2025-12-31T23:00:00Z'),
        grupoCompatibilidade: 'CLASSE_3',
      }),
    );
    let entityPersistida: CargaQuimicaOrmEntity | undefined;
    const manager = {
      save: vi.fn(async (_entityClass, entity: CargaQuimicaOrmEntity) => {
        entity.quantidade.valor = String(
          entity.quantidade.valor,
        ) as unknown as number;
        entityPersistida = entity;
        return entity;
      }),
    };
    const dataSource = {
      transaction: vi.fn(
        async (operacao: (manager: EntityManager) => Promise<void>) =>
          operacao(manager as unknown as EntityManager),
      ),
      getRepository: vi.fn(() => ({
        findOne: vi.fn(async () => entityPersistida ?? null),
      })),
    } as unknown as DataSource;

    const cargaRepository = new TypeOrmCargaQuimicaRepository(dataSource);
    await cargaRepository.salvar(carga);
    const recuperada = await cargaRepository.buscarPorId(carga.id);

    expect(recuperada?.quantidade.valor).toBe(250.5);
  });
});
