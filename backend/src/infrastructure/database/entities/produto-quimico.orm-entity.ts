import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ClassificacaoRiscoEmbeddable } from './classificacao-risco.embeddable.js';

@Entity('produto_quimico')
export class ProdutoQuimicoOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar', unique: true })
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ name: 'grupo_compatibilidade', type: 'varchar' })
  grupoCompatibilidade: string;

  @Column(() => ClassificacaoRiscoEmbeddable, { prefix: false })
  classificacaoRisco: ClassificacaoRiscoEmbeddable;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'data_cadastro', type: 'timestamp' })
  dataCadastro: Date;

  @Column({ name: 'data_atualizacao', type: 'timestamp' })
  dataAtualizacao: Date;
}
