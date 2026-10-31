import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CadastrarResponsavelTecnicoInputDto } from '../../application/dtos/responsavel-tecnico.dto.js';

/**
 * DTO para cadastro de Responsável Técnico via Swagger.
 * Implementa o tipo estrito da camada de aplicação sem violar a Clean Architecture.
 */
export class CadastrarResponsavelTecnicoBodyDto
  implements CadastrarResponsavelTecnicoInputDto
{
  @ApiProperty({
    description: 'Nome completo do responsável técnico',
    example: 'Eng. Maria da Silva Santos',
  })
  nome: string;

  @ApiProperty({
    description: 'CPF válido com 11 dígitos numéricos (com ou sem pontuação)',
    example: '529.982.247-25',
  })
  cpf: string;

  @ApiProperty({
    description: 'Número do registro profissional no conselho de classe (CRQ ou CREA)',
    example: 'CRQ 12345-IV',
  })
  registroProfissional: string;

  @ApiProperty({
    description: 'Unidade Federativa (UF) do conselho emissor do registro',
    example: 'SP',
  })
  ufConselho: string;

  @ApiPropertyOptional({
    description: 'E-mail de contato profissional do responsável técnico',
    example: 'maria.santos@porto.com.br',
  })
  emailContato?: string;
}
