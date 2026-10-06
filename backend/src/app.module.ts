import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CadastrarProdutoUseCase } from './application/use-cases/produtos/cadastrar-produto.use-case.js';
import { InativarProdutoUseCase } from './application/use-cases/produtos/inativar-produto.use-case.js';
import { RegistrarCargaUseCase } from './application/use-cases/cargas/registrar-carga.use-case.js';
import { ValidarDocumentacaoUseCase } from './application/use-cases/cargas/validar-documentacao.use-case.js';
import { LiberarCargaUseCase } from './application/use-cases/cargas/liberar-carga.use-case.js';
import { BloquearCargaUseCase } from './application/use-cases/cargas/bloquear-carga.use-case.js';
import { RealizarInspecaoUseCase } from './application/use-cases/inspecoes/realizar-inspecao.use-case.js';
import { AnexarDocumentoUseCase } from './application/use-cases/cargas/anexar-documento.use-case.js';
import { CadastrarResponsavelTecnicoUseCase } from './application/use-cases/responsaveis/cadastrar-responsavel-tecnico.use-case.js';
import { ResponsavelTecnicoRepository } from './domain/repositories/responsavel-tecnico.repository.interface.js';
import { CadastrarAreaArmazenamentoUseCase } from './application/use-cases/areas/cadastrar-area-armazenamento.use-case.js';
import { InMemoryProdutoQuimicoRepository } from './infrastructure/database/repositories/produto-quimico.repository.js';
import { InMemoryCargaQuimicaRepository } from './infrastructure/database/repositories/carga-quimica.repository.js';
import { TypeOrmResponsavelTecnicoRepository } from './infrastructure/database/repositories/responsavel-tecnico.repository.js';
import { InMemoryAreaArmazenamentoRepository } from './infrastructure/database/repositories/area-armazenamento.repository.js';
import { ProdutoQuimicoOrmEntity } from './infrastructure/database/entities/produto-quimico.orm-entity.js';
import { CargaQuimicaOrmEntity } from './infrastructure/database/entities/carga-quimica.orm-entity.js';
import { DocumentoCargaOrmEntity } from './infrastructure/database/entities/documento-carga.orm-entity.js';
import { InspecaoOrmEntity } from './infrastructure/database/entities/inspecao.orm-entity.js';
import { ResponsavelTecnicoOrmEntity } from './infrastructure/database/entities/responsavel-tecnico.orm-entity.js';
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
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ResponsavelTecnicoOrmEntity]),
  ],
  controllers: [
    AppController,
    ProdutosController,
    CargasController,
    ResponsaveisTecnicosController,
  ],
  providers: [
    AppService,
    InMemoryProdutoQuimicoRepository,
    InMemoryCargaQuimicaRepository,
    {
      provide: 'ResponsavelTecnicoRepository',
      useClass: TypeOrmResponsavelTecnicoRepository,
    },
    InMemoryAreaArmazenamentoRepository,
    {
      provide: 'ProdutoQuimicoRepository',
      useExisting: InMemoryProdutoQuimicoRepository,
    },
    {
      provide: 'CargaQuimicaRepository',
      useExisting: InMemoryCargaQuimicaRepository,
    },
    {
      provide: CadastrarProdutoUseCase,
      useFactory: (repo: InMemoryProdutoQuimicoRepository) =>
        new CadastrarProdutoUseCase(repo),
      inject: [InMemoryProdutoQuimicoRepository],
    },
    {
      provide: InativarProdutoUseCase,
      useFactory: (repo: InMemoryProdutoQuimicoRepository) =>
        new InativarProdutoUseCase(repo),
      inject: [InMemoryProdutoQuimicoRepository],
    },
    {
      provide: RegistrarCargaUseCase,
      useFactory: (
        cargaRepo: InMemoryCargaQuimicaRepository,
        responsavelRepo: ResponsavelTecnicoRepository,
      ) => new RegistrarCargaUseCase(cargaRepo, responsavelRepo),
      inject: [InMemoryCargaQuimicaRepository, 'ResponsavelTecnicoRepository'],
    },
    {
      provide: ValidarDocumentacaoUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) =>
        new ValidarDocumentacaoUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: LiberarCargaUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) =>
        new LiberarCargaUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: BloquearCargaUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) =>
        new BloquearCargaUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: RealizarInspecaoUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) =>
        new RealizarInspecaoUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: AnexarDocumentoUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) =>
        new AnexarDocumentoUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: CadastrarResponsavelTecnicoUseCase,
      useFactory: (repo: ResponsavelTecnicoRepository) =>
        new CadastrarResponsavelTecnicoUseCase(repo),
      inject: ['ResponsavelTecnicoRepository'],
    },
    {
      provide: CadastrarAreaArmazenamentoUseCase,
      useFactory: (repo: InMemoryAreaArmazenamentoRepository) =>
        new CadastrarAreaArmazenamentoUseCase(repo),
      inject: [InMemoryAreaArmazenamentoRepository],
    },
  ],
})
export class AppModule {}
