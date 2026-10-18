import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RegistrarCargaUseCase } from '../../application/use-cases/cargas/registrar-carga.use-case.js';
import { ValidarDocumentacaoUseCase } from '../../application/use-cases/cargas/validar-documentacao.use-case.js';
import { LiberarCargaUseCase } from '../../application/use-cases/cargas/liberar-carga.use-case.js';
import { BloquearCargaUseCase } from '../../application/use-cases/cargas/bloquear-carga.use-case.js';
import { RealizarInspecaoUseCase } from '../../application/use-cases/inspecoes/realizar-inspecao.use-case.js';
import { AnexarDocumentoUseCase } from '../../application/use-cases/cargas/anexar-documento.use-case.js';
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
  ) {}

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
}
