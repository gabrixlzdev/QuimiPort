import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
import { ClassificacaoRisco } from '../../../domain/value-objects/classificacao-risco.vo.js';
import { getOrThrow } from '../../../shared/either.js';
import { ProdutoQuimicoOrmEntity } from '../entities/produto-quimico.orm-entity.js';

@Injectable()
export class TypeOrmProdutoQuimicoRepository implements ProdutoQuimicoRepository {
  constructor(
    @InjectRepository(ProdutoQuimicoOrmEntity)
    private readonly repository: Repository<ProdutoQuimicoOrmEntity>,
  ) {}

  async salvar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
    const entity = await this.repository.save({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      grupoCompatibilidade: produto.grupoCompatibilidade,
      classificacaoRisco: {
        classe: produto.classificacaoRisco.classe,
        subclasse: produto.classificacaoRisco.subclasse,
        numeroONU: produto.classificacaoRisco.numeroONU,
        grupoEmbalagem: produto.classificacaoRisco.grupoEmbalagem,
      },
      ativo: produto.ativo,
      dataCadastro: produto.dataCadastro,
      dataAtualizacao: produto.dataAtualizacao,
    });

    return this.toDomain(entity);
  }

  async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async buscarPorNome(nome: string): Promise<ProdutoQuimico | null> {
    const entity = await this.repository.findOneBy({ nome });
    return entity ? this.toDomain(entity) : null;
  }

  async buscarPorNomeEClasseRisco(
    nome: string,
    classeRisco: string,
  ): Promise<ProdutoQuimico | null> {
    const entity = await this.repository.findOneBy({
      nome,
      classificacaoRisco: { classe: classeRisco },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async listar(): Promise<ProdutoQuimico[]> {
    const entities = await this.repository.find({
      order: { dataCadastro: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  private toDomain(entity: ProdutoQuimicoOrmEntity): ProdutoQuimico {
    return getOrThrow(
      ProdutoQuimico.create({
        id: entity.id,
        nome: entity.nome,
        descricao: entity.descricao,
        grupoCompatibilidade: entity.grupoCompatibilidade,
        classificacaoRisco: getOrThrow(
          ClassificacaoRisco.create(
            entity.classificacaoRisco.classe,
            entity.classificacaoRisco.subclasse,
            entity.classificacaoRisco.numeroONU,
            entity.classificacaoRisco.grupoEmbalagem,
          ),
        ),
        ativo: entity.ativo,
        dataCadastro: entity.dataCadastro,
        dataAtualizacao: entity.dataAtualizacao,
      }),
    );
  }
}
