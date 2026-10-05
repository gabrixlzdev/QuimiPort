import { Cpf } from '../../../domain/value-objects/cpf.vo.js';
import { RegistroProfissional } from '../../../domain/value-objects/registro-profissional.vo.js';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import { ResponsavelTecnicoRepository } from '../../../domain/repositories/responsavel-tecnico.repository.interface.js';
import { generateEntityId } from '../../id-generator.js';
import {
  CadastrarResponsavelTecnicoInputDto,
  ResponsavelTecnicoOutputDto,
} from '../../dtos/responsavel-tecnico.dto.js';

export class CadastrarResponsavelTecnicoUseCase {
  constructor(
    private readonly responsavelRepository: ResponsavelTecnicoRepository,
  ) {}

  async execute(
    input: CadastrarResponsavelTecnicoInputDto,
  ): Promise<ResponsavelTecnicoOutputDto> {
    const responsavel = new ResponsavelTecnico({
      id: generateEntityId('RTC'),
      nome: input.nome,
      cpf: new Cpf(input.cpf),
      registroProfissional: new RegistroProfissional(
        input.registroProfissional,
        input.ufConselho,
      ),
      emailContato: input.emailContato,
    });

    const salvo = await this.responsavelRepository.salvar(responsavel);
    return { id: salvo.id };
  }
}
