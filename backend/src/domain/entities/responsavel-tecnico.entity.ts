import { RegistroProfissional } from '../value-objects/registro-profissional.vo.js';
import { Cpf } from '../value-objects/cpf.vo.js';

export type ResponsavelTecnicoProps = {
  id: string;
  nome: string;
  cpf: Cpf;
  registroProfissional: RegistroProfissional;
  emailContato?: string;
};

export class ResponsavelTecnico {
  public readonly id: string;
  public readonly nome: string;
  public readonly cpf: Cpf;
  public readonly registroProfissional: RegistroProfissional;
  public readonly emailContato?: string;

  constructor(props: ResponsavelTecnicoProps) {
    if (!props.id || !props.nome || !props.cpf || !props.registroProfissional) {
      throw new Error('Responsável técnico inválido.');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.cpf = props.cpf;
    this.registroProfissional = props.registroProfissional;
    this.emailContato = props.emailContato;
  }
}
