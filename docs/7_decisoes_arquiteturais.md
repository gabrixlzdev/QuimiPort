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
  O lançamento excessivo de exceções (`throw new Error()`) para controle de fluxo de negócio (ex: "Carga sem documentação", "Produto inativo") polui a call-stack e torna o fluxo da aplicação imprevisível e custoso computacionalmente no Node.js.

- **Decisão:**
  Adotar o padrão funcional **Either / Result Type** (`Either<DomainError, SuccessResult>`) nos Casos de Uso e Agregados do Domínio.

- **Consequências:**
  - **Positivas:**
    - Explicita na assinatura do método todos os erros de negócio possíveis que ele pode retornar.
    - Obriga o desenvolvedor/Controller a tratar o cenário de falha de forma declarativa.
    - Preserva o uso de exceções apenas para erros verdadeiramente inesperados (ex: queda de banco de dados, falha de rede).
  - **Negativas:**
    - Curva de aprendizado inicial para membros da equipe não familiarizados com programação funcional.
