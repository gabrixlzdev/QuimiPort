import { Column } from 'typeorm';

export class ClassificacaoRiscoEmbeddable {
  @Column({ name: 'classe_risco', type: 'varchar' })
  classe: string;

  @Column({ name: 'subclasse_risco', type: 'varchar', nullable: true })
  subclasse: string;

  @Column({ name: 'numero_onu', type: 'varchar', length: 4 })
  numeroONU: string;

  @Column({ name: 'grupo_embalagem', type: 'varchar', nullable: true })
  grupoEmbalagem: string;
}
