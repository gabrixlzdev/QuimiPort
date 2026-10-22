import { ApiProperty } from '@nestjs/swagger';
import {
  CadastrarProdutoInputDto,
  AtualizarProdutoInputDto,
} from '../../application/dtos/produto-quimico.dto.js';

/**
 * Por que usamos `class` e criamos este arquivo novo em `presentation/dtos/`?
 * 
 * 1. Clean Architecture: Os DTOs originais em `application/dtos/` são intocados para manter a
 *    camada de aplicação pura, sem dependência ou acoplamento com decorators do NestJS (@nestjs/swagger).
 * 
 * 2. Tempo de execução (Runtime): O compilador do TypeScript remove completamente declarações de
 *    `type` ao gerar o JavaScript final. O Swagger (OpenAPI) precisa inspecionar classes em tempo de
 *    execução para montar os esquemas visuais, exemplos e metadados no navegador.
 * 
 * 3. Contrato estrito: O uso de `implements CadastrarProdutoInputDto` garante que qualquer alteração
 *    futura na camada de aplicação obrigue a documentação da API a se manter 100% sincronizada.
 */

export class CadastrarProdutoBodyDto implements CadastrarProdutoInputDto {
  @ApiProperty({
    description: 'Nome comercial ou técnico do produto químico',
    example: 'Ácido Sulfúrico 98%',
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição detalhada e aplicações do produto',
    example: 'Utilizado em processos industriais e refino químico.',
  })
  descricao: string;

  @ApiProperty({
    description: 'Grupo de compatibilidade química para segregação no armazenamento portuário',
    example: 'Ácido forte mineral',
  })
  grupoCompatibilidade: string;

  @ApiProperty({
    description: 'Classe de risco principal (1 a 9 conforme código ONU/IMDG)',
    example: '8',
  })
  classeRisco: string;

  @ApiProperty({
    description: 'Subclasse de risco subsidiário',
    example: '8.1',
  })
  subclasse: string;

  @ApiProperty({
    description: 'Número ONU com 4 dígitos numéricos',
    example: '1830',
  })
  numeroONU: string;

  @ApiProperty({
    description: 'Grupo de embalagem de perigo (I - Alto risco, II - Médio risco, III - Baixo risco)',
    example: 'II',
  })
  grupoEmbalagem: string;
}

export class AtualizarProdutoBodyDto implements AtualizarProdutoInputDto {
  @ApiProperty({
    description: 'Novo nome comercial ou técnico do produto químico',
    example: 'Ácido Sulfúrico Concentrado',
  })
  nome: string;

  @ApiProperty({
    description: 'Nova descrição detalhada e aplicações',
    example: 'Solução industrial com pureza superior a 98%.',
  })
  descricao: string;

  @ApiProperty({
    description: 'Novo grupo de compatibilidade química',
    example: 'Ácido forte mineral',
  })
  grupoCompatibilidade: string;

  @ApiProperty({
    description: 'Classe de risco principal',
    example: '8',
  })
  classeRisco: string;

  @ApiProperty({
    description: 'Subclasse de risco',
    example: '8.1',
  })
  subclasse: string;

  @ApiProperty({
    description: 'Número ONU com 4 dígitos',
    example: '1830',
  })
  numeroONU: string;

  @ApiProperty({
    description: 'Grupo de embalagem',
    example: 'II',
  })
  grupoEmbalagem: string;
}
