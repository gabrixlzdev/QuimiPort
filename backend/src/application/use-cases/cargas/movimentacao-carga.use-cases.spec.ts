import { describe, expect, it, vi } from 'vitest';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { StatusCarga, UnidadeMedida } from '../../../domain/enums.js';
import { CargaNaoEncontradaError } from '../../../domain/errors/carga-quimica.errors.js';
import { CodigoIdentificacao } from '../../../domain/value-objects/codigo-identificacao.vo.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { getOrThrow } from '../../../shared/either.js';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { CancelarCargaUseCase } from './cancelar-carga.use-case.js';
import { ConcluirMovimentacaoUseCase } from './concluir-movimentacao.use-case.js';
import { IniciarMovimentacaoUseCase } from './iniciar-movimentacao.use-case.js';

const criarCarga = () =>
  getOrThrow(
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

const prepararCargaNoStatus = (
  carga: CargaQuimicaAggregate,
  status: StatusCarga,
) => {
  const caminho: Partial<Record<StatusCarga, StatusCarga[]>> = {
    [StatusCarga.LIBERADA]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
    ],
    [StatusCarga.EM_MOVIMENTACAO]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
      StatusCarga.EM_MOVIMENTACAO,
    ],
  };
  for (const proximo of caminho[status] ?? []) {
    getOrThrow(carga.changeStatus(proximo, 'operador-1', 'Preparação.'));
  }
  return carga;
};

describe('casos de uso de movimentação da carga', () => {
  it('inicia a movimentação de uma carga liberada e persiste a auditoria', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const carga = prepararCargaNoStatus(criarCarga(), StatusCarga.LIBERADA);
    await repository.salvar(carga);
    const salvar = vi.spyOn(repository, 'salvar');

    const resultado = await new IniciarMovimentacaoUseCase(repository).execute({
      cargaQuimicaId: carga.id,
      responsavelId: 'operador-2',
      motivo: 'Transporte iniciado.',
    });

    expect(resultado.kind).toBe('right');
    expect(carga.status).toBe(StatusCarga.EM_MOVIMENTACAO);
    expect(carga.historicoStatus.at(-1)).toMatchObject({
      responsavelId: 'operador-2',
      motivo: 'Transporte iniciado.',
    });
    expect(salvar).toHaveBeenCalledOnce();
  });

  it('cancela carga e rejeita quando a carga não existe', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const cancelar = new CancelarCargaUseCase(repository);

    const naoEncontrada = await cancelar.execute({
      cargaQuimicaId: 'ausente',
      responsavelId: 'gestor-1',
      motivo: 'Operação cancelada.',
    });
    expect(naoEncontrada.kind).toBe('left');
    if (naoEncontrada.kind === 'left') {
      expect(naoEncontrada.error).toBeInstanceOf(CargaNaoEncontradaError);
    }

    const carga = criarCarga();
    await repository.salvar(carga);
    const resultado = await cancelar.execute({
      cargaQuimicaId: carga.id,
      responsavelId: 'gestor-1',
      motivo: 'Operação cancelada.',
    });

    expect(resultado.kind).toBe('right');
    expect(carga.status).toBe(StatusCarga.CANCELADA);
  });

  it('conclui somente uma movimentação em andamento', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const carga = prepararCargaNoStatus(
      criarCarga(),
      StatusCarga.EM_MOVIMENTACAO,
    );
    await repository.salvar(carga);
    const concluir = new ConcluirMovimentacaoUseCase(repository);
    const salvar = vi.spyOn(repository, 'salvar');

    const resultado = await concluir.execute({
      cargaQuimicaId: carga.id,
      responsavelId: 'operador-2',
      motivo: 'Entrega concluída.',
    });
    expect(resultado.kind).toBe('right');
    expect(carga.status).toBe(StatusCarga.FINALIZADA);
    expect(salvar).toHaveBeenCalledOnce();

    const foraDaEtapa = await concluir.execute({
      cargaQuimicaId: carga.id,
      responsavelId: 'operador-2',
      motivo: 'Tentativa repetida.',
    });
    expect(foraDaEtapa.kind).toBe('left');
    expect(salvar).toHaveBeenCalledOnce();
  });
});
