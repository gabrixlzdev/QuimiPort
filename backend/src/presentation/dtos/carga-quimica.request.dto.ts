import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusCarga, UnidadeMedida } from '../../domain/enums.js';
import {
  RegistrarCargaInputDto,
  AtualizarStatusCargaInputDto,
  AnexarDocumentoInputDto,
  RealizarInspecaoInputDto,
  LiberarCargaInputDto,
  BloquearCargaInputDto,
  AlterarStatusCargaInputDto,
} from '../../application/dtos/carga-quimica.dto.js';

/**
 * Classes DTO de Carga Química para Documentação OpenAPI (Swagger).
 *
 * Seguem a Clean Architecture: mantêm a camada de aplicação desacoplada de decorators do Nest,
 * implementando estritamente os tipos de entrada definidos em `application/dtos/carga-quimica.dto.ts`.
 */

export class RegistrarCargaBodyDto implements RegistrarCargaInputDto {
  @ApiProperty({
    description:
      'Código alfanumérico identificador da carga (8 a 20 caracteres)',
    example: 'CRQ2026101901',
  })
  codigoIdentificacao: string;

  @ApiProperty({
    description: 'ID do produto químico já cadastrado e ativo no sistema',
    example: 'PRQ2026101901',
  })
  produtoQuimicoId: string;

  @ApiProperty({
    description: 'Quantidade da carga (deve ser estritamente maior que zero)',
    example: 25000,
  })
  quantidadeValor: number;

  @ApiProperty({
    description: 'Unidade de medida da carga',
    enum: UnidadeMedida,
    example: UnidadeMedida.QUILOGRAMAS,
  })
  quantidadeUnidade: UnidadeMedida;

  @ApiProperty({
    description:
      'ID do responsável técnico cadastrado e com registro profissional válido',
    example: 'RTC2026101901',
  })
  responsavelTecnicoId: string;

  @ApiProperty({
    description: 'Porto ou local de origem da carga',
    example: 'Terminal Químico de Santos - Píer 3',
  })
  origem: string;

  @ApiProperty({
    description: 'Destino final planejado da carga',
    example: 'Pátio Químico Retroportuário B',
  })
  destino: string;

  @ApiProperty({
    description: 'Data de entrada ou atracação da carga (formato ISO 8601)',
    example: '2026-10-22T08:00:00.000Z',
  })
  dataEntrada: Date;

  @ApiProperty({
    description:
      'Grupo de compatibilidade química da carga (deve bater com o produto)',
    example: 'Ácido forte mineral',
  })
  grupoCompatibilidade: string;

  @ApiPropertyOptional({
    description:
      'ID da autorização superior (obrigatório se o registro for retroativo)',
    example: 'AUTH-GESTOR-99',
  })
  autorizacaoSuperiorId?: string;
}

export class AtualizarStatusCargaBodyDto implements Omit<
  AtualizarStatusCargaInputDto,
  'cargaQuimicaId'
> {
  @ApiProperty({
    description: 'Novo status desejado para a carga química',
    enum: StatusCarga,
    example: StatusCarga.EM_MOVIMENTACAO,
  })
  status: StatusCarga;

  @ApiProperty({
    description:
      'Identificador do operador ou responsável pela alteração de status',
    example: 'OP-SANTOS-101',
  })
  responsavelId: string;

  @ApiProperty({
    description: 'Motivo ou justificativa detalhada da alteração de status',
    example: 'Iniciando translado interno do berço até o pátio de isolamento.',
  })
  motivo: string;
}

export class AnexarDocumentoBodyDto implements Omit<
  AnexarDocumentoInputDto,
  'cargaQuimicaId'
> {
  @ApiProperty({
    description:
      'Tipo do documento obrigatório (FDS, FISPQ, LICENCA_AMBIENTAL, DECLARACAO_CARGA_PERIGOSA)',
    example: 'FISPQ',
  })
  tipoDocumento: string;

  @ApiProperty({
    description: 'Número de referência ou protocolo do documento',
    example: 'DOC-FDS-2026-091',
  })
  numeroReferencia: string;

  @ApiProperty({
    description: 'URL ou caminho do arquivo armazenado',
    example: 'https://docs.quimiport.com.br/arquivos/fispq-1830.pdf',
  })
  urlArquivo: string;

  @ApiProperty({
    description: 'Data de emissão do documento (YYYY-MM-DD)',
    example: '2026-01-10',
  })
  dataEmissao: string;

  @ApiProperty({
    description: 'Data de validade do documento (YYYY-MM-DD)',
    example: '2027-01-10',
  })
  dataValidade: string;
}

export class RealizarInspecaoBodyDto implements Omit<
  RealizarInspecaoInputDto,
  'cargaQuimicaId' | 'dataSolicitacao' | 'dataRealizacao'
> {
  @ApiPropertyOptional({
    description: 'ID pré-gerado para a inspeção, se aplicável',
    example: 'INS2026101901',
  })
  id?: string;

  @ApiProperty({
    description: 'Data de solicitação da vistoria (formato ISO 8601)',
    example: '2026-10-22T09:00:00.000Z',
  })
  dataSolicitacao: string;

  @ApiProperty({
    description: 'Data da realização física da vistoria (formato ISO 8601)',
    example: '2026-10-22T10:30:00.000Z',
  })
  dataRealizacao: string;

  @ApiProperty({
    description: 'Identificador do inspetor responsável pela vistoria',
    example: 'INSP-SANTOS-45',
  })
  inspetorId: string;

  @ApiProperty({
    description: 'Parecer técnico da inspeção física da carga',
    enum: ['PENDENTE', 'APROVADO', 'REPROVADO'],
    example: 'APROVADO',
  })
  resultado: 'PENDENTE' | 'APROVADO' | 'REPROVADO';

  @ApiPropertyOptional({
    description: 'Observações técnicas levantadas durante a vistoria',
    example: 'Embalagens íntegras, sem vazamentos ou odores atípicos.',
  })
  observacoes?: string;
}

export class LiberarCargaBodyDto implements Omit<
  LiberarCargaInputDto,
  'cargaQuimicaId'
> {
  @ApiProperty({
    description: 'Justificativa operacional e técnica para liberação da carga',
    example:
      'Documentação completa e vistoria aprovada conforme protocolo de segurança.',
  })
  justificativa: string;

  @ApiProperty({
    description: 'ID do responsável ou gestor que autorizou a liberação',
    example: 'GESTOR-PORTUARIO-01',
  })
  responsavelId: string;
}

export class BloquearCargaBodyDto implements Omit<
  BloquearCargaInputDto,
  'cargaQuimicaId'
> {
  @ApiProperty({
    description: 'Motivo técnico do bloqueio imediato da carga',
    example: 'Avaria detectada no invólucro do contêiner durante a inspeção.',
  })
  motivo: string;

  @ApiProperty({
    description: 'ID do inspetor ou responsável pelo bloqueio',
    example: 'INSP-SANTOS-45',
  })
  responsavelId: string;
}

export class AcaoCargaBodyDto implements Omit<
  AlterarStatusCargaInputDto,
  'cargaQuimicaId'
> {
  @ApiProperty({
    description: 'ID do responsável técnico ou operador pela ação',
    example: 'OP-SANTOS-101',
  })
  responsavelId: string;

  @ApiProperty({
    description: 'Motivo ou observação da operação realizada',
    example: 'Operação executada conforme plano de manobra portuária.',
  })
  motivo: string;
}
