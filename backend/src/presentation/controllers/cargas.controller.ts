import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegistrarCargaUseCase } from '../../application/use-cases/cargas/registrar-carga.use-case.js';
import { ValidarDocumentacaoUseCase } from '../../application/use-cases/cargas/validar-documentacao.use-case.js';
import { LiberarCargaUseCase } from '../../application/use-cases/cargas/liberar-carga.use-case.js';
import { BloquearCargaUseCase } from '../../application/use-cases/cargas/bloquear-carga.use-case.js';
import { RealizarInspecaoUseCase } from '../../application/use-cases/inspecoes/realizar-inspecao.use-case.js';
import { AnexarDocumentoUseCase } from '../../application/use-cases/cargas/anexar-documento.use-case.js';
import { CancelarCargaUseCase } from '../../application/use-cases/cargas/cancelar-carga.use-case.js';
import { ConcluirMovimentacaoUseCase } from '../../application/use-cases/cargas/concluir-movimentacao.use-case.js';
import { IniciarMovimentacaoUseCase } from '../../application/use-cases/cargas/iniciar-movimentacao.use-case.js';
import { ListarCargasUseCase } from '../../application/use-cases/cargas/listar-cargas.use-case.js';
import { BuscarCargaUseCase } from '../../application/use-cases/cargas/buscar-carga.use-case.js';
import { AtualizarStatusCargaUseCase } from '../../application/use-cases/cargas/atualizar-status-carga.use-case.js';
import * as cargaQuimicaDto from '../../application/dtos/carga-quimica.dto.js';
import {
  RegistrarCargaBodyDto,
  AtualizarStatusCargaBodyDto,
  AnexarDocumentoBodyDto,
  RealizarInspecaoBodyDto,
  LiberarCargaBodyDto,
  BloquearCargaBodyDto,
  AcaoCargaBodyDto,
} from '../dtos/carga-quimica.request.dto.js';
import { toHttpException } from '../errors/domain-error-http.mapper.js';

@ApiTags('Cargas Químicas')
@Controller('cargas')
export class CargasController {
  constructor(
    private readonly registrarCargaUseCase: RegistrarCargaUseCase,
    private readonly validarDocumentacaoUseCase: ValidarDocumentacaoUseCase,
    private readonly realizarInspecaoUseCase: RealizarInspecaoUseCase,
    private readonly liberarCargaUseCase: LiberarCargaUseCase,
    private readonly bloquearCargaUseCase: BloquearCargaUseCase,
    private readonly anexarDocumentoUseCase: AnexarDocumentoUseCase,
    private readonly iniciarMovimentacaoUseCase: IniciarMovimentacaoUseCase,
    private readonly cancelarCargaUseCase: CancelarCargaUseCase,
    private readonly concluirMovimentacaoUseCase: ConcluirMovimentacaoUseCase,
    private readonly listarCargasUseCase: ListarCargasUseCase,
    private readonly buscarCargaUseCase: BuscarCargaUseCase,
    private readonly atualizarStatusCargaUseCase: AtualizarStatusCargaUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as cargas químicas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cargas retornada com sucesso.',
  })
  async listar(): Promise<cargaQuimicaDto.CargaQuimicaOutputDto[]> {
    const resultado = await this.listarCargasUseCase.execute();
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar carga química por ID' })
  @ApiParam({ name: 'id', description: 'ID da carga química (ex: CRQ-...)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carga química encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  async buscar(
    @Param('id') id: string,
  ): Promise<cargaQuimicaDto.CargaQuimicaOutputDto> {
    const resultado = await this.buscarCargaUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova carga química' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Carga registrada com sucesso com status REGISTRADA.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dados inválidos (quantidade <= 0, código inválido ou falta de aprovação superior em registro retroativo).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto químico ou Responsável Técnico não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'Produto químico inativo ou grupo de compatibilidade divergente.',
  })
  async registrar(
    @Body() body: RegistrarCargaBodyDto,
  ): Promise<cargaQuimicaDto.CargaQuimicaOutputDto> {
    const resultado = await this.registrarCargaUseCase.execute(body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualizar status da carga química (máquina de estados)',
  })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status da carga atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'Transição de status inválida ou violação de regra de negócio da etapa.',
  })
  async atualizarStatus(
    @Param('id') cargaQuimicaId: string,
    @Body() body: AtualizarStatusCargaBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.atualizarStatusCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Status da carga atualizado com sucesso.' };
  }

  @Post(':id/documentos')
  @ApiOperation({ summary: 'Anexar documento obrigatório à carga química' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Documento anexado com sucesso. Status da carga transiciona para EM_ANALISE se for o primeiro anexo.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datas de emissão ou validade do documento inválidas.',
  })
  async anexarDocumento(
    @Param('id') cargaQuimicaId: string,
    @Body() body: AnexarDocumentoBodyDto,
  ): Promise<cargaQuimicaDto.DocumentoCargaOutputDto> {
    const resultado = await this.anexarDocumentoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Patch(':id/documentos/:documentoId/validar')
  @ApiOperation({ summary: 'Validar documento obrigatório de uma carga' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiParam({ name: 'documentoId', description: 'ID do documento a ser validado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento validado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga ou documento não encontrado.',
  })
  async validarDocumento(
    @Param('id') cargaQuimicaId: string,
    @Param('documentoId') documentoId: string,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.validarDocumentacaoUseCase.execute({
      cargaQuimicaId,
      documentoId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Documento validado com sucesso.' };
  }

  @Post(':id/inspecoes')
  @ApiOperation({ summary: 'Registrar vistoria/inspeção física na carga química' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Inspeção registrada. Transiciona para EM_INSPECAO ou BLOQUEADA se reprovada.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'Inspeção fora de etapa permitida ou carga já bloqueada.',
  })
  async registrarInspecao(
    @Param('id') cargaQuimicaId: string,
    @Body() body: RealizarInspecaoBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.realizarInspecaoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Inspeção registrada com sucesso.' };
  }

  @Post(':id/liberar')
  @ApiOperation({ summary: 'Liberar carga química para movimentação' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carga liberada com sucesso (status LIBERADA).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Justificativa de liberação é obrigatória.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'Carga não pode ser liberada (sem documentação válida, documento vencido ou sem inspeção aprovada).',
  })
  async liberar(
    @Param('id') cargaQuimicaId: string,
    @Body() body: LiberarCargaBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.liberarCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Carga liberada com sucesso.' };
  }

  @Post(':id/bloquear')
  @ApiOperation({ summary: 'Bloquear carga química' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carga bloqueada com sucesso (status BLOQUEADA).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Motivo de bloqueio é obrigatório.',
  })
  async bloquear(
    @Param('id') cargaQuimicaId: string,
    @Body() body: BloquearCargaBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.bloquearCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Carga bloqueada com sucesso.' };
  }

  @Post(':id/iniciar-movimentacao')
  @ApiOperation({ summary: 'Iniciar movimentação de uma carga liberada' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Movimentação iniciada com sucesso (status EM_MOVIMENTACAO).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Carga não está com status LIBERADA para movimentar.',
  })
  async iniciarMovimentacao(
    @Param('id') cargaQuimicaId: string,
    @Body() body: AcaoCargaBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.iniciarMovimentacaoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Movimentação iniciada com sucesso.' };
  }

  @Post(':id/concluir-movimentacao')
  @ApiOperation({ summary: 'Concluir movimentação e finalizar a carga' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carga finalizada com sucesso (status FINALIZADA, estado terminal).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Carga não está em movimentação para ser concluída.',
  })
  async concluirMovimentacao(
    @Param('id') cargaQuimicaId: string,
    @Body() body: AcaoCargaBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.concluirMovimentacaoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Movimentação concluída com sucesso.' };
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar carga química' })
  @ApiParam({ name: 'id', description: 'ID da carga química' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Carga cancelada com sucesso (status CANCELADA, estado terminal).',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Carga química não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Carga já finalizada ou cancelada não pode ser alterada.',
  })
  async cancelar(
    @Param('id') cargaQuimicaId: string,
    @Body() body: AcaoCargaBodyDto,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.cancelarCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Carga cancelada com sucesso.' };
  }
}
