import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ResultadoInspecao } from '../../../domain/enums.js';
import { CargaQuimicaOrmEntity } from './carga-quimica.orm-entity.js';

@Entity('inspecao')
export class InspecaoOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ name: 'data_solicitacao', type: 'timestamp' })
  dataSolicitacao: Date;

  @Column({ name: 'data_realizacao', type: 'timestamp' })
  dataRealizacao: Date;

  @Column({ name: 'inspetor_id', type: 'varchar' })
  inspetorId: string;

  @Column({ type: 'enum', enum: ResultadoInspecao })
  resultado: ResultadoInspecao;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @ManyToOne(() => CargaQuimicaOrmEntity, (carga) => carga.inspecoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'carga_quimica_id' })
  carga: Relation<CargaQuimicaOrmEntity>;
}
