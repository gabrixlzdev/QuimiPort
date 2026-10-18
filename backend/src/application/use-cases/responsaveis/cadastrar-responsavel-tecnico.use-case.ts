import { Cpf } from '../../../domain/value-objects/cpf.vo.js';
import { RegistroProfissional } from '../../../domain/value-objects/registro-profissional.vo.js';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import {
  CPFInvalidoError,
  RegistroProfissionalInvalidoError,
  ResponsavelTecnicoInvalidoError,
} from '../../../domain/errors/responsavel-tecnico.errors.js';
import { ResponsavelTecnicoRepository } from '../../../domain/repositories/responsavel-tecnico.repository.interface.js';
import { Either, right } from '../../../shared/either.js';
import { generateEntityId } from '../../id-generator.js';
import {
  CadastrarResponsavelTecnicoInputDto,
  ResponsavelTecnicoOutputDto,
} from '../../dtos/responsavel-tecnico.dto.js';

export type CadastrarResponsavelTecnicoError =
  | CPFInvalidoError
  | RegistroProfissionalInvalidoError
  | ResponsavelTecnicoInvalidoError;

export class CadastrarResponsavelTecnicoUseCase {
  constructor(
    private readonly responsavelRepository: ResponsavelTecnicoRepository,
  ) {}

  async execute(
    input: CadastrarResponsavelTecnicoInputDto,
  ): Promise<
    Either<CadastrarResponsavelTecnicoError, ResponsavelTecnicoOutputDto>
  > {
    const cpf = Cpf.create(input.cpf);
    if (cpf.kind === 'left') return cpf;

    const registroProfissional = RegistroProfissional.create(
      input.registroProfissional,
      input.ufConselho,
    );
    if (registroProfissional.kind === 'left') return registroProfissional;

    const responsavel = ResponsavelTecnico.create({
      id: generateEntityId('RTC'),
      nome: input.nome,
      cpf: cpf.value,
      registroProfissional: registroProfissional.value,
      emailContato: input.emailContato,
    });
    if (responsavel.kind === 'left') return responsavel;

    const salvo = await this.responsavelRepository.salvar(responsavel.value);
    return right({ id: salvo.id });
  }
}
