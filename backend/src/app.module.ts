import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CadastrarProdutoUseCase } from './application/use-cases/produtos/cadastrar-produto.use-case.js';
import { InativarProdutoUseCase } from './application/use-cases/produtos/inativar-produto.use-case.js';
import { ListarProdutosUseCase } from './application/use-cases/produtos/listar-produtos.use-case.js';
import { BuscarProdutoUseCase } from './application/use-cases/produtos/buscar-produto.use-case.js';
import { AtualizarProdutoUseCase } from './application/use-cases/produtos/atualizar-produto.use-case.js';
import { RegistrarCargaUseCase } from './application/use-cases/cargas/registrar-carga.use-case.js';
import { ValidarDocumentacaoUseCase } from './application/use-cases/cargas/validar-documentacao.use-case.js';
import { LiberarCargaUseCase } from './application/use-cases/cargas/liberar-carga.use-case.js';
import { BloquearCargaUseCase } from './application/use-cases/cargas/bloquear-carga.use-case.js';
import { RealizarInspecaoUseCase } from './application/use-cases/inspecoes/realizar-inspecao.use-case.js';
import { AnexarDocumentoUseCase } from './application/use-cases/cargas/anexar-documento.use-case.js';
import { CancelarCargaUseCase } from './application/use-cases/cargas/cancelar-carga.use-case.js';
import { ConcluirMovimentacaoUseCase } from './application/use-cases/cargas/concluir-movimentacao.use-case.js';
import { IniciarMovimentacaoUseCase } from './application/use-cases/cargas/iniciar-movimentacao.use-case.js';
import { ListarCargasUseCase } from './application/use-cases/cargas/listar-cargas.use-case.js';
import { BuscarCargaUseCase } from './application/use-cases/cargas/buscar-carga.use-case.js';
import { CadastrarResponsavelTecnicoUseCase } from './application/use-cases/responsaveis/cadastrar-responsavel-tecnico.use-case.js';
import { ResponsavelTecnicoRepository } from './domain/repositories/responsavel-tecnico.repository.interface.js';
import { CadastrarAreaArmazenamentoUseCase } from './application/use-cases/areas/cadastrar-area-armazenamento.use-case.js';
import { TypeOrmProdutoQuimicoRepository } from './infrastructure/database/repositories/typeorm-produto-quimico.repository.js';
import { TypeOrmCargaQuimicaRepository } from './infrastructure/database/repositories/typeorm-carga-quimica.repository.js';
import { TypeOrmResponsavelTecnicoRepository } from './infrastructure/database/repositories/responsavel-tecnico.repository.js';
import { TypeOrmAreaArmazenamentoRepository } from './infrastructure/database/repositories/typeorm-area-armazenamento.repository.js';
import { ProdutoQuimicoOrmEntity } from './infrastructure/database/entities/produto-quimico.orm-entity.js';
import { CargaQuimicaOrmEntity } from './infrastructure/database/entities/carga-quimica.orm-entity.js';
import { DocumentoCargaOrmEntity } from './infrastructure/database/entities/documento-carga.orm-entity.js';
import { InspecaoOrmEntity } from './infrastructure/database/entities/inspecao.orm-entity.js';
import { HistoricoStatusCargaOrmEntity } from './infrastructure/database/entities/historico-status-carga.orm-entity.js';
import { ResponsavelTecnicoOrmEntity } from './infrastructure/database/entities/responsavel-tecnico.orm-entity.js';
import { AreaArmazenamentoOrmEntity } from './infrastructure/database/entities/area-armazenamento.orm-entity.js';
import { ProdutosController } from './presentation/controllers/produtos.controller.js';
import { CargasController } from './presentation/controllers/cargas.controller.js';
import { ResponsaveisTecnicosController } from './presentation/controllers/responsaveis-tecnicos.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        entities: [
          ProdutoQuimicoOrmEntity,
          CargaQuimicaOrmEntity,
          DocumentoCargaOrmEntity,
          InspecaoOrmEntity,
          ResponsavelTecnicoOrmEntity,
          HistoricoStatusCargaOrmEntity,
          AreaArmazenamentoOrmEntity,
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      ProdutoQuimicoOrmEntity,
      ResponsavelTecnicoOrmEntity,
      AreaArmazenamentoOrmEntity,
    ]),
  ],
  controllers: [
    AppController,
    ProdutosController,
    CargasController,
    ResponsaveisTecnicosController,
  ],
  providers: [
    AppService,
    TypeOrmProdutoQuimicoRepository,
    TypeOrmCargaQuimicaRepository,
    {
      provide: 'ResponsavelTecnicoRepository',
      useClass: TypeOrmResponsavelTecnicoRepository,
    },
    TypeOrmAreaArmazenamentoRepository,
    {
      provide: 'ProdutoQuimicoRepository',
      useExisting: TypeOrmProdutoQuimicoRepository,
    },
    {
      provide: 'CargaQuimicaRepository',
      useExisting: TypeOrmCargaQuimicaRepository,
    },
    {
      provide: CadastrarProdutoUseCase,
      useFactory: (repo: TypeOrmProdutoQuimicoRepository) =>
        new CadastrarProdutoUseCase(repo),
      inject: [TypeOrmProdutoQuimicoRepository],
    },
    {
      provide: ListarProdutosUseCase,
      useFactory: (repo: TypeOrmProdutoQuimicoRepository) =>
        new ListarProdutosUseCase(repo),
      inject: [TypeOrmProdutoQuimicoRepository],
    },
    {
      provide: BuscarProdutoUseCase,
      useFactory: (repo: TypeOrmProdutoQuimicoRepository) =>
        new BuscarProdutoUseCase(repo),
      inject: [TypeOrmProdutoQuimicoRepository],
    },
    {
      provide: AtualizarProdutoUseCase,
      useFactory: (repo: TypeOrmProdutoQuimicoRepository) =>
        new AtualizarProdutoUseCase(repo),
      inject: [TypeOrmProdutoQuimicoRepository],
    },
    {
      provide: InativarProdutoUseCase,
      useFactory: (repo: TypeOrmProdutoQuimicoRepository) =>
        new InativarProdutoUseCase(repo),
      inject: [TypeOrmProdutoQuimicoRepository],
    },
    {
      provide: RegistrarCargaUseCase,
      useFactory: (
        cargaRepo: TypeOrmCargaQuimicaRepository,
        responsavelRepo: ResponsavelTecnicoRepository,
        produtoRepo: TypeOrmProdutoQuimicoRepository,
      ) => new RegistrarCargaUseCase(cargaRepo, responsavelRepo, produtoRepo),
      inject: [
        TypeOrmCargaQuimicaRepository,
        'ResponsavelTecnicoRepository',
        TypeOrmProdutoQuimicoRepository,
      ],
    },
    {
      provide: ValidarDocumentacaoUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new ValidarDocumentacaoUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: LiberarCargaUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new LiberarCargaUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: BloquearCargaUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new BloquearCargaUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: RealizarInspecaoUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new RealizarInspecaoUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: AnexarDocumentoUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new AnexarDocumentoUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: IniciarMovimentacaoUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new IniciarMovimentacaoUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: CancelarCargaUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new CancelarCargaUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: ConcluirMovimentacaoUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new ConcluirMovimentacaoUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: ListarCargasUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new ListarCargasUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: BuscarCargaUseCase,
      useFactory: (repo: TypeOrmCargaQuimicaRepository) =>
        new BuscarCargaUseCase(repo),
      inject: [TypeOrmCargaQuimicaRepository],
    },
    {
      provide: CadastrarResponsavelTecnicoUseCase,
      useFactory: (repo: ResponsavelTecnicoRepository) =>
        new CadastrarResponsavelTecnicoUseCase(repo),
      inject: ['ResponsavelTecnicoRepository'],
    },
    {
      provide: CadastrarAreaArmazenamentoUseCase,
      useFactory: (
        areaRepo: TypeOrmAreaArmazenamentoRepository,
        cargaRepo: TypeOrmCargaQuimicaRepository,
      ) => new CadastrarAreaArmazenamentoUseCase(areaRepo, cargaRepo),
      inject: [
        TypeOrmAreaArmazenamentoRepository,
        TypeOrmCargaQuimicaRepository,
      ],
    },
  ],
})
export class AppModule {}
