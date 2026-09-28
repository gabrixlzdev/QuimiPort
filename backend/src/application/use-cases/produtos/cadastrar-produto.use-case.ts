import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import { ClassificacaoRisco } from '../../../domain/value-objects/classificacao-risco.vo.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { CadastrarProdutoInputDto, ProdutoQuimicoOutputDto } from '../../dtos/produto-quimico.dto.js';

export class CadastrarProdutoUseCase {
  constructor(private readonly produtoRepository: ProdutoQuimicoRepository) {}

  async execute(input: CadastrarProdutoInputDto): Promise<ProdutoQuimicoOutputDto> {
    const produtoExistente = await this.produtoRepository.buscarPorNome(input.nome);
    if (produtoExistente) {
      throw new Error('Produto químico já cadastrado com esse nome.');
    }

    const produto = new ProdutoQuimico({
      id: input.id ?? crypto.randomUUID(),
      nome: input.nome,
      descricao: input.descricao,
      grupoCompatibilidade: input.grupoCompatibilidade,
      classificacaoRisco: new ClassificacaoRisco(
        input.classeRisco,
        input.subclasse,
        input.numeroONU,
        input.grupoEmbalagem,
      ),
      ativo: input.ativo ?? true,
    });

    const salvo = await this.produtoRepository.salvar(produto);

    return {
      id: salvo.id,
      nome: salvo.nome,
      descricao: salvo.descricao,
      grupoCompatibilidade: salvo.grupoCompatibilidade,
      classeRisco: salvo.classificacaoRisco.classe,
      subclasse: salvo.classificacaoRisco.subclasse,
      numeroONU: salvo.classificacaoRisco.numeroONU,
      grupoEmbalagem: salvo.classificacaoRisco.grupoEmbalagem,
      ativo: salvo.ativo,
    };
  }
}
