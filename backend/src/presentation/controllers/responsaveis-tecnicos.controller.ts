import { Body, Controller, Post } from '@nestjs/common';
import { CadastrarResponsavelTecnicoUseCase } from '../../application/use-cases/responsaveis/cadastrar-responsavel-tecnico.use-case.js';
import type {
  CadastrarResponsavelTecnicoInputDto,
  ResponsavelTecnicoOutputDto,
} from '../../application/dtos/responsavel-tecnico.dto.js';
import { toHttpException } from '../errors/domain-error-http.mapper.js';

@Controller('responsaveis-tecnicos')
export class ResponsaveisTecnicosController {
  constructor(
    private readonly cadastrarResponsavelTecnicoUseCase: CadastrarResponsavelTecnicoUseCase,
  ) {}

  @Post()
  async cadastrar(
    @Body() body: CadastrarResponsavelTecnicoInputDto,
  ): Promise<ResponsavelTecnicoOutputDto> {
    const resultado =
      await this.cadastrarResponsavelTecnicoUseCase.execute(body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }
}
