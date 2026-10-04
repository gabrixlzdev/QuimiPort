import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { StatusCarga } from '../../../domain/enums.js';
import { QuantidadeCargaEmbeddable } from './quantidade-carga.embeddable.js';
import { DocumentoCargaOrmEntity } from './documento-carga.orm-entity.js';
import { InspecaoOrmEntity } from './inspecao.orm-entity.js';

@Entity('carga_quimica')
export class CargaQuimicaOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ name: 'codigo_identificacao', type: 'varchar', unique: true })
  codigoIdentificacao: string;

  @Column({ name: 'produto_quimico_id', type: 'varchar' })
  produtoQuimicoId: string;

  @Column(() => QuantidadeCargaEmbeddable, { prefix: false })
  quantidade: QuantidadeCargaEmbeddable;

  @Column({ name: 'responsavel_tecnico_id', type: 'varchar' })
  responsavelTecnicoId: string;

  @Column({ type: 'varchar' })
  origem: string;

  @Column({ type: 'varchar' })
  destino: string;

  @Column({ name: 'data_entrada', type: 'timestamp' })
  dataEntrada: Date;

  @Column({ name: 'grupo_compatibilidade', type: 'varchar' })
  grupoCompatibilidade: string;

  @Column({ type: 'enum', enum: StatusCarga })
  status: StatusCarga;

  @OneToMany(() => DocumentoCargaOrmEntity, (documento) => documento.carga, {
    cascade: true,
  })
  documentos: Relation<DocumentoCargaOrmEntity>[];

  @OneToMany(() => InspecaoOrmEntity, (inspecao) => inspecao.carga, {
    cascade: true,
  })
  inspecoes: Relation<InspecaoOrmEntity>[];
}
