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
import { InMemoryProdutoQuimicoRepository } from './infrastructure/database/repositories/produto-quimico.repository.js';
import { InMemoryCargaQuimicaRepository } from './infrastructure/database/repositories/carga-quimica.repository.js';
import { ProdutosController } from './presentation/controllers/produtos.controller.js';
import { CargasController } from './presentation/controllers/cargas.controller.js';

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
        entities: [],
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController, ProdutosController, CargasController],
  providers: [
    AppService,
    InMemoryProdutoQuimicoRepository,
    InMemoryCargaQuimicaRepository,
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
      useFactory: (repo: InMemoryProdutoQuimicoRepository) => new CadastrarProdutoUseCase(repo),
      inject: [InMemoryProdutoQuimicoRepository],
    },
    {
      provide: InativarProdutoUseCase,
      useFactory: (repo: InMemoryProdutoQuimicoRepository) => new InativarProdutoUseCase(repo),
      inject: [InMemoryProdutoQuimicoRepository],
    },
    {
      provide: RegistrarCargaUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) => new RegistrarCargaUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: ValidarDocumentacaoUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) => new ValidarDocumentacaoUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: LiberarCargaUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) => new LiberarCargaUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: BloquearCargaUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) => new BloquearCargaUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
    {
      provide: RealizarInspecaoUseCase,
      useFactory: (repo: InMemoryCargaQuimicaRepository) => new RealizarInspecaoUseCase(repo),
      inject: [InMemoryCargaQuimicaRepository],
    },
  ],
})
export class AppModule {}
