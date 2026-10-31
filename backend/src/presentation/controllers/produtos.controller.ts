import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CadastrarProdutoUseCase } from '../../application/use-cases/produtos/cadastrar-produto.use-case.js';
import { ListarProdutosUseCase } from '../../application/use-cases/produtos/listar-produtos.use-case.js';
import { BuscarProdutoUseCase } from '../../application/use-cases/produtos/buscar-produto.use-case.js';
import { AtualizarProdutoUseCase } from '../../application/use-cases/produtos/atualizar-produto.use-case.js';
import { InativarProdutoUseCase } from '../../application/use-cases/produtos/inativar-produto.use-case.js';
import * as produtoQuimicoDto from '../../application/dtos/produto-quimico.dto.js';
import {
  CadastrarProdutoBodyDto,
  AtualizarProdutoBodyDto,
} from '../dtos/produto-quimico.request.dto.js';
import { toHttpException } from '../errors/domain-error-http.mapper.js';

@ApiTags('Produtos Químicos')
@Controller('produtos-quimicos')
export class ProdutosController {
  constructor(
    private readonly cadastrarProdutoUseCase: CadastrarProdutoUseCase,
    private readonly listarProdutosUseCase: ListarProdutosUseCase,
    private readonly buscarProdutoUseCase: BuscarProdutoUseCase,
    private readonly atualizarProdutoUseCase: AtualizarProdutoUseCase,
    private readonly inativarProdutoUseCase: InativarProdutoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo produto químico' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Produto químico cadastrado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dados cadastrais inválidos (nome, classe de risco ou ONU ausentes).',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe um produto com o mesmo nome e classe de risco.',
  })
  async cadastrar(
    @Body() body: CadastrarProdutoBodyDto,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.cadastrarProdutoUseCase.execute(body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos químicos cadastrados' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de produtos químicos retornada com sucesso.',
  })
  async listar(): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto[]> {
    const resultado = await this.listarProdutosUseCase.execute();
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto químico por ID' })
  @ApiParam({
    name: 'id',
    description: 'Identificador do produto químico (ex: PRQ-...)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produto químico encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto químico não encontrado.',
  })
  async buscar(
    @Param('id') id: string,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.buscarProdutoUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar dados cadastrais de um produto químico',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador do produto químico a ser atualizado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produto atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados cadastrais inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto químico não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Novo nome e classe de risco já pertencem a outro produto.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() body: AtualizarProdutoBodyDto,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.atualizarProdutoUseCase.execute(id, body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Patch(':id/inativar')
  @ApiOperation({ summary: 'Inativar um produto químico' })
  @ApiParam({
    name: 'id',
    description: 'Identificador do produto químico a ser inativado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produto químico inativado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produto químico não encontrado.',
  })
  async inativar(
    @Param('id') id: string,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.inativarProdutoUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }
}
