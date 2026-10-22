import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CadastrarResponsavelTecnicoUseCase } from '../../application/use-cases/responsaveis/cadastrar-responsavel-tecnico.use-case.js';
import * as responsavelTecnicoDto from '../../application/dtos/responsavel-tecnico.dto.js';
import { CadastrarResponsavelTecnicoBodyDto } from '../dtos/responsavel-tecnico.request.dto.js';
import { toHttpException } from '../errors/domain-error-http.mapper.js';

@ApiTags('Responsáveis Técnicos')
@Controller('responsaveis-tecnicos')
export class ResponsaveisTecnicosController {
  constructor(
    private readonly cadastrarResponsavelTecnicoUseCase: CadastrarResponsavelTecnicoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo responsável técnico (CRQ/CREA)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Responsável técnico cadastrado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos (CPF inválido, registro profissional sem UF ou dados ausentes).',
  })
  async cadastrar(
    @Body() body: CadastrarResponsavelTecnicoBodyDto,
  ): Promise<responsavelTecnicoDto.ResponsavelTecnicoOutputDto> {
    const resultado =
      await this.cadastrarResponsavelTecnicoUseCase.execute(body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }
}
