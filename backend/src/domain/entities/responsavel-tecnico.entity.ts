import { RegistroProfissional } from '../value-objects/registro-profissional.vo.js';

export type ResponsavelTecnicoProps = {
  id: string;
  nome: string;
  registroProfissional: RegistroProfissional;
  emailContato?: string;
};

export class ResponsavelTecnico {
  public readonly id: string;
  public readonly nome: string;
  public readonly registroProfissional: RegistroProfissional;
  public readonly emailContato?: string;

  constructor(props: ResponsavelTecnicoProps) {
    if (!props.id || !props.nome || !props.registroProfissional) {
      throw new Error('Responsável técnico inválido.');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.registroProfissional = props.registroProfissional;
    this.emailContato = props.emailContato;
  }
}
