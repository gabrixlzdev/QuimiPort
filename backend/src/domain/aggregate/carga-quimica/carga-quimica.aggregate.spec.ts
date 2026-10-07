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
      dataCriacao: new Date('2025-12-31T23:00:00Z'),
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

    expect(() =>
      carga.liberarCarga('Liberado após validação', 'operador-1'),
    ).not.toThrow();
    expect(carga.status).toBe(StatusCarga.LIBERADA);
    expect(carga.historicoStatus.map((evento) => evento.statusNovo)).toEqual([
      StatusCarga.AGUARDANDO_DOCUMENTACAO,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
    ]);
    expect(carga.historicoStatus[1]).toMatchObject({
      responsavelId: 'inspetor-1',
      motivo: 'Tudo conforme',
    });
    expect(carga.historicoStatus[2]).toMatchObject({
      responsavelId: 'operador-1',
      motivo: 'Liberado após validação',
    });
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
    expect(carga.historicoStatus.at(-1)).toMatchObject({
      statusAnterior: StatusCarga.AGUARDANDO_DOCUMENTACAO,
      statusNovo: StatusCarga.BLOQUEADA,
      responsavelId: 'inspetor-1',
      motivo: 'Embalagem danificada',
    });
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

    expect(() =>
      carga.liberarCarga('Sem documentação válida', 'operador-1'),
    ).toThrow(/Documentação incompleta|Impossível liberar/i);
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

    expect(() =>
      carga.liberarCarga('Sem inspeção aprovada', 'operador-1'),
    ).toThrow(/Nenhuma inspeção aprovada|Impossível liberar/i);
  });

  it('deve impedir anexar documento em carga cancelada', () => {
    const carga = criarCarga();
    carga.changeStatus(
      StatusCarga.CANCELADA,
      'operador-1',
      'Cancelamento solicitado.',
    );

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

    expect(() =>
      carga.changeStatus(StatusCarga.FINALIZADA, 'operador-1', 'Finalização.'),
    ).toThrow(/transição/i);
  });

  it('deve registrar data de criação e rejeitar transição sem auditoria', () => {
    const carga = criarCarga();

    expect(carga.dataCriacao).toEqual(new Date('2025-12-31T23:00:00Z'));
    expect(carga.historicoStatus[0]).toMatchObject({
      statusAnterior: null,
      statusNovo: StatusCarga.AGUARDANDO_DOCUMENTACAO,
      responsavelId: 'responsavel-1',
      motivo: 'Carga criada.',
    });
    expect(carga.historicoStatus[0].data).toEqual(carga.dataCriacao);
    expect(() =>
      carga.changeStatus(StatusCarga.CANCELADA, '', 'Cancelamento.'),
    ).toThrow(/responsável/i);
    expect(carga.historicoStatus).toHaveLength(1);
    expect(carga.status).toBe(StatusCarga.AGUARDANDO_DOCUMENTACAO);
  });

  it('deve restaurar o histórico sem duplicar o evento inicial', () => {
    const original = criarCarga();
    original.changeStatus(
      StatusCarga.CANCELADA,
      'operador-1',
      'Cancelamento solicitado.',
      new Date('2026-01-02T00:00:00Z'),
    );

    const restaurada = CargaQuimicaAggregate.restaurar(
      {
        id: original.id,
        codigoIdentificacao: original.codigoIdentificacao,
        produtoQuimicoId: original.produtoQuimicoId,
        quantidade: original.quantidade,
        responsavelTecnicoId: original.responsavelTecnicoId,
        origem: original.origem,
        destino: original.destino,
        dataEntrada: original.dataEntrada,
        dataCriacao: original.dataCriacao,
        grupoCompatibilidade: original.grupoCompatibilidade,
        status: original.status,
      },
      original.historicoStatus,
    );

    expect(restaurada.status).toBe(StatusCarga.CANCELADA);
    expect(restaurada.historicoStatus).toEqual(original.historicoStatus);
    expect(restaurada.historicoStatus).toHaveLength(2);
  });

  it('deve rejeitar reidratação quando o status diverge do histórico', () => {
    const original = criarCarga();

    expect(() =>
      CargaQuimicaAggregate.restaurar(
        {
          id: original.id,
          codigoIdentificacao: original.codigoIdentificacao,
          produtoQuimicoId: original.produtoQuimicoId,
          quantidade: original.quantidade,
          responsavelTecnicoId: original.responsavelTecnicoId,
          origem: original.origem,
          destino: original.destino,
          dataEntrada: original.dataEntrada,
          dataCriacao: original.dataCriacao,
          grupoCompatibilidade: original.grupoCompatibilidade,
          status: StatusCarga.CANCELADA,
        },
        original.historicoStatus,
      ),
    ).toThrow(/diverge do histórico/i);
  });
});
