import { Body, Controller, Post } from '@nestjs/common';
import { CadastrarResponsavelTecnicoUseCase } from '../../application/use-cases/responsaveis/cadastrar-responsavel-tecnico.use-case.js';
import type {
  CadastrarResponsavelTecnicoInputDto,
  ResponsavelTecnicoOutputDto,
} from '../../application/dtos/responsavel-tecnico.dto.js';

@Controller('responsaveis-tecnicos')
export class ResponsaveisTecnicosController {
  constructor(
    private readonly cadastrarResponsavelTecnicoUseCase: CadastrarResponsavelTecnicoUseCase,
  ) {}

  @Post()
  async cadastrar(
    @Body() body: CadastrarResponsavelTecnicoInputDto,
  ): Promise<ResponsavelTecnicoOutputDto> {
    return this.cadastrarResponsavelTecnicoUseCase.execute(body);
  }
}
