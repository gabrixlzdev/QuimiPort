import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CadastrarProdutoUseCase } from '../../application/use-cases/produtos/cadastrar-produto.use-case.js';
import { InativarProdutoUseCase } from '../../application/use-cases/produtos/inativar-produto.use-case.js';
import * as produtoQuimicoDto from '../../application/dtos/produto-quimico.dto.js';
import { toHttpException } from '../errors/domain-error-http.mapper.js';

@Controller('produtos')
export class ProdutosController {
  constructor(
    private readonly cadastrarProdutoUseCase: CadastrarProdutoUseCase,
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

  @Delete(':id')
  async inativar(
    @Param('id') id: string,
  ): Promise<{ id: string; mensagem: string }> {
    const resultado = await this.inativarProdutoUseCase.execute(id);
    if (resultado.kind === 'left') throw toHttpException(resultado.error);

    return { id, mensagem: 'Produto inativado com sucesso.' };
  }

  @Get()
  async listar(): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto[]> {
    return [];
  }
}
