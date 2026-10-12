import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CargaQuimicaOrmEntity } from './carga-quimica.orm-entity.js';

@Entity('area_armazenamento')
export class AreaArmazenamentoOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'varchar' })
  codigo: string;

  @Column({ type: 'varchar' })
  tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';

  @Column({ name: 'capacidade_maxima', type: 'double precision' })
  capacidadeMaxima: number;

  @Column({ name: 'quantidade_ocupada', type: 'double precision' })
  quantidadeOcupada: number;

  @ManyToOne(() => CargaQuimicaOrmEntity, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'carga_quimica_id' })
  carga: Relation<CargaQuimicaOrmEntity>;
}
