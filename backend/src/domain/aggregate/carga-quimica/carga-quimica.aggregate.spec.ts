import { describe, it, expect } from 'vitest';
import { CargaQuimicaAggregate } from './carga-quimica.aggregate.js';
import {
  StatusCarga,
  StatusValidacao,
  ResultadoInspecao,
  UnidadeMedida,
} from '../../enums.js';
import { DocumentoCarga } from './documento-carga.entity.js';
import { Inspecao } from '../../entities/inspecao.entity.js';
import { QuantidadeCarga } from '../../value-objects/quantidade-carga.vo.js';

describe('CargaQuimicaAggregate', () => {
  const criarCarga = () =>
    new CargaQuimicaAggregate({
      id: 'carga-1',
      codigoIdentificacao: 'ABC12345',
      produtoQuimicoId: 'produto-1',
      quantidade: new QuantidadeCarga(1200, UnidadeMedida.QUILOGRAMAS),
      responsavelTecnicoId: 'responsavel-1',
      origem: 'Santos',
      destino: 'Rio',
      dataEntrada: new Date('2026-01-01T00:00:00Z'),
      grupoCompatibilidade: 'CLASSE_8',
    });

  it('deve liberar carga com documentação válida e inspeção aprovada', () => {
    const carga = criarCarga();

    carga.anexarDocumento(
      new DocumentoCarga({
        id: 'doc-1',
        tipoDocumento: 'FDS',
        numeroReferencia: 'REF-001',
        urlArquivo: 'https://example.com/fds.pdf',
        dataEmissao: new Date('2025-01-01'),
        dataValidade: new Date('2030-01-01'),
        statusValidacao: StatusValidacao.VALIDADO,
      }),
    );

    carga.registrarInspecao(
      new Inspecao({
        id: 'inspecao-1',
        dataSolicitacao: new Date('2026-01-02'),
        dataRealizacao: new Date('2026-01-03'),
        inspetorId: 'inspetor-1',
        resultado: ResultadoInspecao.APROVADO,
        observacoes: 'Tudo conforme',
      }),
    );

    expect(() => carga.liberarCarga('Liberado após validação')).not.toThrow();
    expect(carga.status).toBe(StatusCarga.LIBERADA);
  });

  it('deve bloquear carga quando a inspeção é reprovada', () => {
    const carga = criarCarga();

    carga.registrarInspecao(
      new Inspecao({
        id: 'inspecao-2',
        dataSolicitacao: new Date('2026-01-02'),
        dataRealizacao: new Date('2026-01-03'),
        inspetorId: 'inspetor-1',
        resultado: ResultadoInspecao.REPROVADO,
        observacoes: 'Embalagem danificada',
      }),
    );

    expect(carga.status).toBe(StatusCarga.BLOQUEADA);
  });

  it('deve rejeitar tentativa de liberar sem documentação válida', () => {
    const carga = criarCarga();

    carga.registrarInspecao(
      new Inspecao({
        id: 'inspecao-3',
        dataSolicitacao: new Date('2026-01-02'),
        dataRealizacao: new Date('2026-01-03'),
        inspetorId: 'inspetor-1',
        resultado: ResultadoInspecao.APROVADO,
        observacoes: 'Tudo ok',
      }),
    );

    expect(() => carga.liberarCarga('Sem documentação válida')).toThrow(
      /Documentação incompleta|Impossível liberar/i,
    );
  });

  it('deve rejeitar tentativa de liberar sem inspeção aprovada', () => {
    const carga = criarCarga();

    carga.anexarDocumento(
      new DocumentoCarga({
        id: 'doc-2',
        tipoDocumento: 'FDS',
        numeroReferencia: 'REF-002',
        urlArquivo: 'https://example.com/fds-2.pdf',
        dataEmissao: new Date('2025-01-01'),
        dataValidade: new Date('2030-01-01'),
        statusValidacao: StatusValidacao.VALIDADO,
      }),
    );

    expect(() => carga.liberarCarga('Sem inspeção aprovada')).toThrow(
      /Nenhuma inspeção aprovada|Impossível liberar/i,
    );
  });

  it('deve impedir anexar documento em carga cancelada', () => {
    const carga = criarCarga();
    carga.changeStatus(StatusCarga.CANCELADA);

    expect(() =>
      carga.anexarDocumento(
        new DocumentoCarga({
          id: 'doc-3',
          tipoDocumento: 'FDS',
          numeroReferencia: 'REF-003',
          urlArquivo: 'https://example.com/fds-3.pdf',
          dataEmissao: new Date('2025-01-01'),
          dataValidade: new Date('2030-01-01'),
          statusValidacao: StatusValidacao.VALIDADO,
        }),
      ),
    ).toThrow(/imutável/i);
  });

  it('deve rejeitar transição inválida de status', () => {
    const carga = criarCarga();

    expect(() => carga.changeStatus(StatusCarga.FINALIZADA)).toThrow(
      /transição/i,
    );
  });
});
