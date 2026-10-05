import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { StatusValidacao } from '../../../domain/enums.js';
import { CargaQuimicaOrmEntity } from './carga-quimica.orm-entity.js';

@Entity('documento_carga')
export class DocumentoCargaOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ name: 'tipo_documento', type: 'varchar' })
  tipoDocumento: string;

  @Column({ name: 'numero_referencia', type: 'varchar' })
  numeroReferencia: string;

  @Column({ name: 'url_arquivo', type: 'text' })
  urlArquivo: string;

  @Column({ name: 'data_emissao', type: 'timestamp' })
  dataEmissao: Date;

  @Column({ name: 'data_validade', type: 'timestamp' })
  dataValidade: Date;

  @Column({ name: 'status_validacao', type: 'enum', enum: StatusValidacao })
  statusValidacao: StatusValidacao;

  @ManyToOne(() => CargaQuimicaOrmEntity, (carga) => carga.documentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'carga_quimica_id' })
  carga: Relation<CargaQuimicaOrmEntity>;
}
