import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('responsavel_tecnico')
export class ResponsavelTecnicoOrmEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'varchar' })
  cpf: string;

  @Column({ name: 'registro_profissional', type: 'varchar' })
  registroProfissional: string;

  @Column({ name: 'uf_conselho', type: 'varchar', length: 2 })
  ufConselho: string;

  @Column({ name: 'email_contato', type: 'varchar', nullable: true })
  emailContato: string | null;
}
