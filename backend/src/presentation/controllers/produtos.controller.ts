import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CadastrarProdutoUseCase } from '../../application/use-cases/produtos/cadastrar-produto.use-case.js';
import { InativarProdutoUseCase } from '../../application/use-cases/produtos/inativar-produto.use-case.js';
import * as produtoQuimicoDto from '../../application/dtos/produto-quimico.dto.js';

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
    return this.cadastrarProdutoUseCase.execute(body);
  }

  @Delete(':id')
  async inativar(
    @Param('id') id: string,
  ): Promise<{ id: string; mensagem: string }> {
    await this.inativarProdutoUseCase.execute(id);
    return { id, mensagem: 'Produto inativado com sucesso.' };
  }

  @Get()
  async listar(): Promise<produtoQuimicoDto.ProdutoQuimicoOutputDto[]> {
    return [];
  }
}
