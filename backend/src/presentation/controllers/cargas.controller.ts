import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { toHttpException } from '../errors/domain-error-http.mapper.js';

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
  async listar(): Promise<cargaQuimicaDto.CargaQuimicaOutputDto[]> {
    const resultado = await this.listarCargasUseCase.execute();
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Get(':id')
  async buscar(
    @Param('id') id: string,
  ): Promise<cargaQuimicaDto.CargaQuimicaOutputDto> {
    const resultado = await this.buscarCargaUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Post()
  async registrar(
    @Body() body: cargaQuimicaDto.RegistrarCargaInputDto,
  ): Promise<cargaQuimicaDto.CargaQuimicaOutputDto> {
    const resultado = await this.registrarCargaUseCase.execute(body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Patch(':id/documentos/:documentoId/validar')
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

  @Post(':id/documentos')
  async anexarDocumento(
    @Param('id') cargaQuimicaId: string,
    @Body() body: Omit<cargaQuimicaDto.AnexarDocumentoInputDto, 'cargaQuimicaId'>,
  ): Promise<cargaQuimicaDto.DocumentoCargaOutputDto> {
    const resultado = await this.anexarDocumentoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Post(':id/inspecoes')
  async registrarInspecao(
    @Param('id') cargaQuimicaId: string,
    @Body()
    body: Omit<cargaQuimicaDto.RealizarInspecaoInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.realizarInspecaoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Inspeção registrada com sucesso.' };
  }

  @Post(':id/liberar')
  async liberar(
    @Param('id') cargaQuimicaId: string,
    @Body() body: Omit<cargaQuimicaDto.LiberarCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.liberarCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Carga liberada com sucesso.' };
  }

  @Post(':id/bloquear')
  async bloquear(
    @Param('id') cargaQuimicaId: string,
    @Body() body: Omit<cargaQuimicaDto.BloquearCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.bloquearCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Carga bloqueada com sucesso.' };
  }

  @Post(':id/iniciar-movimentacao')
  async iniciarMovimentacao(
    @Param('id') cargaQuimicaId: string,
    @Body()
    body: Omit<cargaQuimicaDto.AlterarStatusCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.iniciarMovimentacaoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Movimentação iniciada com sucesso.' };
  }

  @Post(':id/cancelar')
  async cancelar(
    @Param('id') cargaQuimicaId: string,
    @Body()
    body: Omit<cargaQuimicaDto.AlterarStatusCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.cancelarCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Carga cancelada com sucesso.' };
  }

  @Post(':id/concluir-movimentacao')
  async concluirMovimentacao(
    @Param('id') cargaQuimicaId: string,
    @Body()
    body: Omit<cargaQuimicaDto.AlterarStatusCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.concluirMovimentacaoUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Movimentação concluída com sucesso.' };
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Param('id') cargaQuimicaId: string,
    @Body()
    body: Omit<cargaQuimicaDto.AtualizarStatusCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    const resultado = await this.atualizarStatusCargaUseCase.execute({
      ...body,
      cargaQuimicaId,
    });
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { mensagem: 'Status da carga atualizado com sucesso.' };
  }
}
