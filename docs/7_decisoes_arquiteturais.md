# 7. REGISTRO DE DECISÕES ARQUITETURAIS (ADRs)

---

## ADR 001: Adoção do TypeScript e Node.js para o Core da Aplicação

- **Status:** Aprovado
- **Data:**
- **Contexto:**
  O sistema **QuimiPort** gerencia movimentações críticas de produtos químicos perigosos, exigindo validações rígidas de estado e regras de negócio complexas. Havia a necessidade de escolher uma linguagem que combinasse alta produtividade, suporte nativo a tipagem estática e facilidade de manutenção para o paradigma do Domain-Driven Design (DDD).

- **Decisão:**
  Adotamos o **TypeScript (Node.js)** com modo estrito (`strict: true`) habilitado.

- **Consequências:**
  - **Positivas:**
    - Detecção de erros de tipo e violações de contratos de domínio em tempo de compilação.
    - Suporte nativo a Enums, Interfaces, Modificadores de Acesso (`readonly`, `private`) essenciais para construir Value Objects e Agregados imutáveis.
    - Ecossistema robusto para testes unitários rápidos (`Vitest` / `Jest`).
  - **Negativas:**
    - Necessidade de etapa adicional de compilação/build (`tsc` / `esbuild`).

---

## ADR 002: Implementação da Clean Architecture em Camadas Isoladas

- **Status:** Aprovado
- **Data:**
- **Contexto:**
  O software precisa isolar completamente as regras de negócio operacionais das ferramentas de infraestrutura (bancos de dados, frameworks web, bibliotecas de terceiros) para evitar obsolescência técnica e facilitar a escrita de testes unitários sem dependências de I/O.

- **Decisão:**
  Estruturar o projeto seguindo a **Clean Architecture**, dividindo a aplicação nas camadas `domain`, `application`, `infrastructure` e `presentation`.

- **Consequências:**
  - **Positivas:**
    - A camada de `domain` é 100% pura e isenta de dependências do Node.js/NPM externas.
    - O banco de dados ou a biblioteca HTTP podem ser substituídos sem impactar a regra de negócio.
    - Permite testar 100% dos Casos de Uso e Agregados utilizando Repositórios em Memória (_In-Memory Repositories_).
  - **Negativas:**
    - Mapeamento adicional de dados entre camadas (Entidades do Domínio vs DTOs vs ORM Entities).

---

## ADR 003: Tratamento Funcional de Erros de Domínio com o Padrão Either / Result

- **Status:** Aprovado
- **Data:**
- **Contexto:**
  O sistema QuimiPort opera com regras de negócio críticas e cenários de validação recorrentes, como documentos ausentes, inspeções reprovadas, transições de status inválidas, produtos inativos e cargas bloqueadas. O uso excessivo de exceções (`throw new Error()`) para controlar esse fluxo torna a aplicação menos previsível, polui a call-stack e mistura regras de domínio com falhas técnicas. A decisão será alinhada com a Clean Architecture, em que regras de negócio devem permanecer explícitas e independentes de infraestrutura.

- **Decisão:**
  Adotar o padrão funcional **Either / Result Type** (`Either<DomainError, SuccessResult>`) nos Casos de Uso e Agregados do Domínio, de modo que todo resultado de negócio seja expresso em um contrato tipado: `Left` para falhas esperadas e `Right` para sucesso.

- **Consequências:**
  - **Positivas:**
    - Explicita na assinatura do método todos os erros de negócio possíveis que ele pode retornar.
    - Torna o contrato da operação legível e auto-documentado para a camada de aplicação e para a apresentação.
    - Força o tratamento declarativo do cenário de falha e evita o uso de exceções como mecanismo principal de controle de fluxo do domínio.
    - Mantém o uso de exceções apenas para erros verdadeiramente inesperados, como indisponibilidade de banco, falha de rede ou problemas de infraestrutura.
    - Alinha a solução com a Clean Architecture, em que a lógica de negócio permanece explícita e independente de frameworks e infraestrutura.
  - **Negativas:**
    - Curva de aprendizado inicial para membros da equipe não familiarizados com programação funcional.
    - Exige disciplina de modelagem para que cada erro de negócio seja representado corretamente por um tipo bem definido.

> Esta ADR permanece formalmente aprovada porque o padrão Either / Result não é apenas uma técnica de implementação, mas uma decisão arquitetural que organiza a representação das falhas do negócio de forma coerente com a modelagem de domínio e com os casos de uso do projeto.
