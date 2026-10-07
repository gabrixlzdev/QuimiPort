import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { DocumentoCarga } from '../../../domain/aggregate/carga-quimica/documento-carga.entity.js';
import { Inspecao } from '../../../domain/entities/inspecao.entity.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { CargaQuimicaOrmEntity } from '../entities/carga-quimica.orm-entity.js';
import { DocumentoCargaOrmEntity } from '../entities/documento-carga.orm-entity.js';
import { HistoricoStatusCargaOrmEntity } from '../entities/historico-status-carga.orm-entity.js';
import { InspecaoOrmEntity } from '../entities/inspecao.orm-entity.js';
import { QuantidadeCargaEmbeddable } from '../entities/quantidade-carga.embeddable.js';
import { ResponsavelTecnicoOrmEntity } from '../entities/responsavel-tecnico.orm-entity.js';

@Injectable()
export class TypeOrmCargaQuimicaRepository implements CargaQuimicaRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async salvar(carga: CargaQuimicaAggregate): Promise<CargaQuimicaAggregate> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(CargaQuimicaOrmEntity, this.toOrmEntity(carga));
    });
    return carga;
  }

  async buscarPorId(id: string): Promise<CargaQuimicaAggregate | null> {
    const entity = await this.dataSource
      .getRepository(CargaQuimicaOrmEntity)
      .findOne({
        where: { id },
        relations: {
          responsavelTecnico: true,
          documentos: true,
          inspecoes: true,
          historicoStatus: true,
        },
      });

    return entity ? this.toDomain(entity) : null;
  }

  async listar(): Promise<CargaQuimicaAggregate[]> {
    const entities = await this.dataSource
      .getRepository(CargaQuimicaOrmEntity)
      .find({
        relations: {
          responsavelTecnico: true,
          documentos: true,
          inspecoes: true,
          historicoStatus: true,
        },
      });

    return entities.map((entity) => this.toDomain(entity));
  }

  private toOrmEntity(carga: CargaQuimicaAggregate): CargaQuimicaOrmEntity {
    const entity = new CargaQuimicaOrmEntity();
    entity.id = carga.id;
    entity.codigoIdentificacao = carga.codigoIdentificacao;
    entity.produtoQuimicoId = carga.produtoQuimicoId;
    entity.quantidade = Object.assign(new QuantidadeCargaEmbeddable(), {
      valor: carga.quantidade.valor,
      unidade: carga.quantidade.unidade,
    });
    entity.responsavelTecnico = Object.assign(
      new ResponsavelTecnicoOrmEntity(),
      { id: carga.responsavelTecnicoId },
    );
    entity.origem = carga.origem;
    entity.destino = carga.destino;
    entity.dataEntrada = carga.dataEntrada;
    entity.dataCriacao = carga.dataCriacao;
    entity.grupoCompatibilidade = carga.grupoCompatibilidade;
    entity.status = carga.status;
    entity.documentos = carga.documentos.map((documento) => {
      const documentoEntity = Object.assign(new DocumentoCargaOrmEntity(), {
        id: documento.id,
        tipoDocumento: documento.tipoDocumento,
        numeroReferencia: documento.numeroReferencia,
        urlArquivo: documento.urlArquivo,
        dataEmissao: documento.dataEmissao,
        dataValidade: documento.dataValidade,
        statusValidacao: documento.statusValidacao,
        carga: entity,
      });
      return documentoEntity;
    });
    entity.inspecoes = carga.inspecoes.map((inspecao) =>
      Object.assign(new InspecaoOrmEntity(), {
        id: inspecao.id,
        dataSolicitacao: inspecao.dataSolicitacao,
        dataRealizacao: inspecao.dataRealizacao,
        inspetorId: inspecao.inspetorId,
        resultado: inspecao.resultado,
        observacoes: inspecao.observacoes,
        carga: entity,
      }),
    );
    entity.historicoStatus = carga.historicoStatus.map((evento, sequencia) =>
      Object.assign(new HistoricoStatusCargaOrmEntity(), {
        id: `${carga.id}-status-${sequencia}`,
        sequencia,
        statusAnterior: evento.statusAnterior,
        statusNovo: evento.statusNovo,
        data: evento.data,
        responsavelId: evento.responsavelId,
        motivo: evento.motivo,
        carga: entity,
      }),
    );
    return entity;
  }

  private toDomain(entity: CargaQuimicaOrmEntity): CargaQuimicaAggregate {
    const carga = CargaQuimicaAggregate.restaurar(
      {
        id: entity.id,
        codigoIdentificacao: entity.codigoIdentificacao,
        produtoQuimicoId: entity.produtoQuimicoId,
        quantidade: new QuantidadeCarga(
          entity.quantidade.valor,
          entity.quantidade.unidade,
        ),
        responsavelTecnicoId: entity.responsavelTecnico.id,
        origem: entity.origem,
        destino: entity.destino,
        dataEntrada: entity.dataEntrada,
        dataCriacao: entity.dataCriacao,
        grupoCompatibilidade: entity.grupoCompatibilidade,
        status: entity.status,
      },
      [...entity.historicoStatus]
        .sort((a, b) => a.sequencia - b.sequencia)
        .map((evento) => ({
          statusAnterior: evento.statusAnterior,
          statusNovo: evento.statusNovo,
          data: evento.data,
          responsavelId: evento.responsavelId,
          motivo: evento.motivo,
        })),
    );

    carga.documentos = entity.documentos.map(
      (documento) =>
        new DocumentoCarga({
          id: documento.id,
          tipoDocumento: documento.tipoDocumento,
          numeroReferencia: documento.numeroReferencia,
          urlArquivo: documento.urlArquivo,
          dataEmissao: documento.dataEmissao,
          dataValidade: documento.dataValidade,
          statusValidacao: documento.statusValidacao,
        }),
    );
    carga.inspecoes = entity.inspecoes.map(
      (inspecao) =>
        new Inspecao({
          id: inspecao.id,
          dataSolicitacao: inspecao.dataSolicitacao,
          dataRealizacao: inspecao.dataRealizacao,
          inspetorId: inspecao.inspetorId,
          resultado: inspecao.resultado,
          observacoes: inspecao.observacoes,
        }),
    );
    return carga;
  }
}
