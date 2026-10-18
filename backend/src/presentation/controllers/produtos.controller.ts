import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { CadastrarProdutoUseCase } from '../../application/use-cases/produtos/cadastrar-produto.use-case.js';
import { ListarProdutosUseCase } from '../../application/use-cases/produtos/listar-produtos.use-case.js';
import { BuscarProdutoUseCase } from '../../application/use-cases/produtos/buscar-produto.use-case.js';
import { AtualizarProdutoUseCase } from '../../application/use-cases/produtos/atualizar-produto.use-case.js';
import { InativarProdutoUseCase } from '../../application/use-cases/produtos/inativar-produto.use-case.js';
import * as produtoQuimicoDto from '../../application/dtos/produto-quimico.dto.js';
import { toHttpException } from '../errors/domain-error-http.mapper.js';

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
  async cadastrar(
    @Body() body: produtoQuimicoDto.CadastrarProdutoInputDto,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.cadastrarProdutoUseCase.execute(body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Get()
  async listar(): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto[]> {
    const resultado = await this.listarProdutosUseCase.execute();
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Get(':id')
  async buscar(
    @Param('id') id: string,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.buscarProdutoUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() body: produtoQuimicoDto.AtualizarProdutoInputDto,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.atualizarProdutoUseCase.execute(id, body);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }

  @Patch(':id/inativar')
  async inativar(
    @Param('id') id: string,
  ): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto> {
    const resultado = await this.inativarProdutoUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return resultado.value;
  }
}
