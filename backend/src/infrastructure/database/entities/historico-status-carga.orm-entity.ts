import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { StatusCarga } from '../../../domain/enums.js';
import { CargaQuimicaOrmEntity } from './carga-quimica.orm-entity.js';

@Entity('historico_status_carga')
@Index(['carga', 'sequencia'], { unique: true })
export class HistoricoStatusCargaOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'int' })
  sequencia: number;

  @Column({ name: 'status_anterior', type: 'enum', enum: StatusCarga, nullable: true })
  statusAnterior: StatusCarga | null;

  @Column({ name: 'status_novo', type: 'enum', enum: StatusCarga })
  statusNovo: StatusCarga;

  @Column({ name: 'data_hora', type: 'timestamp' })
  data: Date;

  @Column({ name: 'responsavel_id', type: 'varchar' })
  responsavelId: string;

  @Column({ type: 'text' })
  motivo: string;

  @ManyToOne(() => CargaQuimicaOrmEntity, (carga) => carga.historicoStatus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'carga_quimica_id' })
  carga: Relation<CargaQuimicaOrmEntity>;
}
