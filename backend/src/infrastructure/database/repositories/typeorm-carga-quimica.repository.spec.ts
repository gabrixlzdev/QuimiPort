import { describe, expect, it, vi } from 'vitest';
import type { DataSource, EntityManager } from 'typeorm';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { StatusCarga, UnidadeMedida } from '../../../domain/enums.js';
import { CargaQuimicaOrmEntity } from '../entities/carga-quimica.orm-entity.js';
import { TypeOrmCargaQuimicaRepository } from './typeorm-carga-quimica.repository.js';

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

    const carga = new CargaQuimicaAggregate({
      id: 'carga-1',
      codigoIdentificacao: 'ABC12345',
      produtoQuimicoId: 'produto-1',
      quantidade: new QuantidadeCarga(100, UnidadeMedida.QUILOGRAMAS),
      responsavelTecnicoId: 'responsavel-1',
      origem: 'Santos',
      destino: 'Rio',
      dataEntrada: new Date('2026-01-01T00:00:00Z'),
      dataCriacao: new Date('2025-12-31T23:00:00Z'),
      grupoCompatibilidade: 'CLASSE_8',
    });
    carga.changeStatus(
      StatusCarga.CANCELADA,
      'operador-1',
      'Cancelamento solicitado.',
      new Date('2026-01-02T00:00:00Z'),
    );

    const cargaRepository = new TypeOrmCargaQuimicaRepository(dataSource);
    await cargaRepository.salvar(carga);

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(manager.save).toHaveBeenCalledOnce();
    expect(entityPersistida?.dataCriacao).toEqual(carga.dataCriacao);
    expect(entityPersistida?.historicoStatus).toHaveLength(2);
    expect(entityPersistida?.historicoStatus[1]).toMatchObject({
      id: 'carga-1-status-1',
      sequencia: 1,
      statusAnterior: StatusCarga.AGUARDANDO_DOCUMENTACAO,
      statusNovo: StatusCarga.CANCELADA,
      responsavelId: 'operador-1',
      motivo: 'Cancelamento solicitado.',
    });

    const recuperada = await cargaRepository.buscarPorId(carga.id);

    expect(recuperada?.status).toBe(StatusCarga.CANCELADA);
    expect(recuperada?.dataCriacao).toEqual(carga.dataCriacao);
    expect(recuperada?.historicoStatus).toEqual(carga.historicoStatus);
  });
});
