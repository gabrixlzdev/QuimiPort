import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RegistrarCargaUseCase } from '../../application/use-cases/cargas/registrar-carga.use-case.js';
import { ValidarDocumentacaoUseCase } from '../../application/use-cases/cargas/validar-documentacao.use-case.js';
import { LiberarCargaUseCase } from '../../application/use-cases/cargas/liberar-carga.use-case.js';
import { BloquearCargaUseCase } from '../../application/use-cases/cargas/bloquear-carga.use-case.js';
import { RealizarInspecaoUseCase } from '../../application/use-cases/inspecoes/realizar-inspecao.use-case.js';
import { AnexarDocumentoUseCase } from '../../application/use-cases/cargas/anexar-documento.use-case.js';
import * as cargaQuimicaDto from '../../application/dtos/carga-quimica.dto.js';

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
    return this.registrarCargaUseCase.execute(body);
  }

  @Patch(':id/documentos/:documentoId/validar')
  async validarDocumento(
    @Param('id') cargaQuimicaId: string,
    @Param('documentoId') documentoId: string,
  ): Promise<{ mensagem: string }> {
    await this.validarDocumentacaoUseCase.execute({
      cargaQuimicaId,
      documentoId,
    });
    return { mensagem: 'Documento validado com sucesso.' };
  }

  @Post(':id/documentos')
  async anexarDocumento(
    @Param('id') cargaQuimicaId: string,
    @Body() body: Omit<cargaQuimicaDto.AnexarDocumentoInputDto, 'cargaQuimicaId'>,
  ): Promise<cargaQuimicaDto.DocumentoCargaOutputDto> {
    return this.anexarDocumentoUseCase.execute({ ...body, cargaQuimicaId });
  }

  @Post(':id/inspecoes')
  async registrarInspecao(
    @Param('id') cargaQuimicaId: string,
    @Body()
    body: Omit<cargaQuimicaDto.RealizarInspecaoInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    await this.realizarInspecaoUseCase.execute({ ...body, cargaQuimicaId });
    return { mensagem: 'Inspeção registrada com sucesso.' };
  }

  @Post(':id/liberar')
  async liberar(
    @Param('id') cargaQuimicaId: string,
    @Body() body: Omit<cargaQuimicaDto.LiberarCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    await this.liberarCargaUseCase.execute({ ...body, cargaQuimicaId });
    return { mensagem: 'Carga liberada com sucesso.' };
  }

  @Post(':id/bloquear')
  async bloquear(
    @Param('id') cargaQuimicaId: string,
    @Body() body: Omit<cargaQuimicaDto.BloquearCargaInputDto, 'cargaQuimicaId'>,
  ): Promise<{ mensagem: string }> {
    await this.bloquearCargaUseCase.execute({ ...body, cargaQuimicaId });
    return { mensagem: 'Carga bloqueada com sucesso.' };
  }
}
