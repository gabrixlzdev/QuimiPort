import { describe, expect, it } from 'vitest';
import { InMemoryAreaArmazenamentoRepository } from '../../../infrastructure/database/repositories/area-armazenamento.repository.js';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { UnidadeMedida } from '../../../domain/enums.js';
import { CadastrarAreaArmazenamentoUseCase } from './cadastrar-area-armazenamento.use-case.js';

describe('CadastrarAreaArmazenamentoUseCase', () => {
  const criarCarga = (id: string) =>
    new CargaQuimicaAggregate({
      id,
      codigoIdentificacao: 'ABC12345',
      produtoQuimicoId: 'produto-1',
      quantidade: new QuantidadeCarga(100, UnidadeMedida.QUILOGRAMAS),
      responsavelTecnicoId: 'responsavel-1',
      origem: 'Santos',
      destino: 'Rio',
      dataEntrada: new Date('2026-01-01T00:00:00Z'),
      grupoCompatibilidade: 'CLASSE_8',
    });

  it('gera ID ARM e persiste a área criada quando a carga existe', async () => {
    const areaRepository = new InMemoryAreaArmazenamentoRepository();
    const cargaRepository = new InMemoryCargaQuimicaRepository();
    await cargaRepository.salvar(criarCarga('carga-1'));
    const useCase = new CadastrarAreaArmazenamentoUseCase(
      areaRepository,
      cargaRepository,
    );

    const output = await useCase.execute({
      nome: 'Pátio A',
      codigo: 'PA-01',
      tipo: 'PATIO',
      cargaQuimicaId: 'carga-1',
      capacidadeMaxima: 1000,
      quantidadeOcupada: 500,
    });

    expect(output.id).toMatch(
      /^ARM-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(await areaRepository.buscarPorId(output.id)).not.toBeNull();
  });

  it('não persiste área quando a carga química não existe', async () => {
    const areaRepository = new InMemoryAreaArmazenamentoRepository();
    const cargaRepository = new InMemoryCargaQuimicaRepository();
    const useCase = new CadastrarAreaArmazenamentoUseCase(
      areaRepository,
      cargaRepository,
    );

    await expect(
      useCase.execute({
        nome: 'Pátio A',
        codigo: 'PA-01',
        tipo: 'PATIO',
        cargaQuimicaId: 'carga-inexistente',
        capacidadeMaxima: 1000,
        quantidadeOcupada: 500,
      }),
    ).rejects.toThrow('Carga química não encontrada.');
    expect(await areaRepository.listar()).toEqual([]);
  });
});
