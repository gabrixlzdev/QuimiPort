import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { StatusAreaArmazenamento } from '../../../domain/enums.js';
import { AreaArmazenamento } from '../../../domain/entities/area-armazenamento.entity.js';
import { AreaArmazenamentoOrmEntity } from '../entities/area-armazenamento.orm-entity.js';
import { CargaQuimicaOrmEntity } from '../entities/carga-quimica.orm-entity.js';
import { TypeOrmAreaArmazenamentoRepository } from './typeorm-area-armazenamento.repository.js';
import { getOrThrow } from '../../../shared/either.js';

describe('TypeOrmAreaArmazenamentoRepository', () => {
  const criarOrmEntity = () =>
    Object.assign(new AreaArmazenamentoOrmEntity(), {
      id: 'area-1',
      nome: 'Pátio A',
      codigo: 'PA-01',
      tipo: 'PATIO' as const,
      capacidadeMaxima: 1000,
      quantidadeOcupada: 1000,
      carga: Object.assign(new CargaQuimicaOrmEntity(), { id: 'carga-1' }),
    });

  it('persiste os dados da área e o vínculo com a carga', async () => {
    const entity = criarOrmEntity();
    const repository = {
      save: vi.fn(async () => entity),
      findOne: vi.fn(),
      find: vi.fn(),
    } as unknown as Repository<AreaArmazenamentoOrmEntity>;
    const areaRepository = new TypeOrmAreaArmazenamentoRepository(repository);
    const area = getOrThrow(
      AreaArmazenamento.create({
        id: 'area-1',
        nome: 'Pátio A',
        codigo: 'PA-01',
        tipo: 'PATIO',
        cargaQuimicaId: 'carga-1',
        capacidadeMaxima: 1000,
        quantidadeOcupada: 1000,
      }),
    );

    const salva = await areaRepository.salvar(area);

    expect(repository.save).toHaveBeenCalledWith({
      id: 'area-1',
      nome: 'Pátio A',
      codigo: 'PA-01',
      tipo: 'PATIO',
      capacidadeMaxima: 1000,
      quantidadeOcupada: 1000,
      carga: { id: 'carga-1' },
    });
    expect(salva).toMatchObject({
      id: 'area-1',
      cargaQuimicaId: 'carga-1',
      status: StatusAreaArmazenamento.LOTADA,
    });
  });

  it('busca e lista áreas com a relação da carga carregada', async () => {
    const entity = criarOrmEntity();
    const repository = {
      save: vi.fn(),
      findOne: vi.fn(async () => entity),
      find: vi.fn(async () => [entity]),
    } as unknown as Repository<AreaArmazenamentoOrmEntity>;
    const areaRepository = new TypeOrmAreaArmazenamentoRepository(repository);

    const area = await areaRepository.buscarPorId('area-1');
    const areas = await areaRepository.listar();

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'area-1' },
      relations: { carga: true },
    });
    expect(repository.find).toHaveBeenCalledWith({
      relations: { carga: true },
    });
    expect(area?.cargaQuimicaId).toBe('carga-1');
    expect(areas.map(({ cargaQuimicaId }) => cargaQuimicaId)).toEqual([
      'carga-1',
    ]);
  });
});
