# 6. PLANO DE QUALIDADE E TESTES DE SOFTWARE

---

## 6.1 Estratégia e Pirâmide de Testes

Para garantir a confiabilidade técnica e a aderência estrita às Regras de Negócio (`RN-PRQ`, `RN-CRQ`, `RN-RTC`, `RN-DOC`, `RN-INS`, `RN-ARM`), a estratégia de testes do **QuimiPort** baseia-se no ecossistema **TypeScript (Node.js)** utilizando **Vitest / Jest** como test runner.

A arquitetura do projeto adota a clássica Pirâmide de Testes:

````text
       / \
      /   \     [ Testes E2E / Integration ] (10%) - Controllers & DB (Supertest)
     /     \
    /-------\   [ Testes de Casos de Uso ]  (30%) - Application Layer (Mocks/InMemory)
   /         \
  /-----------\ [ Testes Unitários/Domínio ] (60%) - Aggregates, Entities & VOs (Puros)

## 6.2 Matriz de Cobertura de Testes Unitários (Exemplos de Cenários)

| Domínio / Código | Objeto / Módulo | Cenário de Teste / Regra Validada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **[RN-PRQ-03]** | `ClassificacaoRisco` (VO) | Tentar instanciar classe de risco inválida ou nula | Retornar erro de validação (`Left/DomainError`) |
| **[RN-PRQ-05]** | `RegistrarCarga` (UC) | Associar um produto químico com status `INATIVO` a uma nova carga | Bloquear o registro e retornar falha de negócio |
| **[RN-CRQ-03]** | `QuantidadeCarga` (VO) | Criar quantidade de carga com valor menor ou igual a zero | Lançar exceção/erro de domínio no VO |
| **[RN-CRQ-07]** | `CargaQuimica` (Aggregate) | Tentar liberar carga com inspeção pendente ou reprovada | Impedir a transição do status para `LIBERADA` |
| **[RN-CRQ-10]** | `CargaQuimica` (Aggregate) | Tentar movimentar uma carga com status `BLOQUEADA` | Lançar exceção de transição de estado inválida |
| **[RN-CRQ-11]** | `CargaQuimica` (Aggregate) | Alterar status de uma carga que está `CANCELADA` | Lançar erro de estado terminal imutável |
| **[RN-RTC-02]** | `CPF` (VO) | Validar algoritmo de CPF com dígitos verificadores incorretos | Retornar falha de CPF inválido |
| **[RN-ARM-05]** | `AreaArmazenamento` (Entidade)| Alocar carga que excede a capacidade máxima do setor | Impedir a alocação e disparar erro `CapacidadeExcedidaError` |

---

## 6.3 Exemplo de Implementação de Teste Unitário em TypeScript (Jest / Vitest)

O exemplo abaixo ilustra o teste de transição de estado e validação da máquina de estados do Agregado `CargaQuimica`:

```typescript
import { describe, it, expect } from 'vitest';
import { CargaQuimica } from '../../domain/aggregates/carga-quimica/carga-quimica.aggregate';
import { StatusCarga } from '../../domain/aggregates/carga-quimica/status-carga.enum';
import { DomainError } from '../../domain/errors/domain.error';

describe('CargaQuimica Aggregate - Regras de Liberação e Transição de Estado', () => {

  it('deve impedir a liberação de uma carga sem a documentação obrigatória [RN-CRQ-09]', () => {
    // Arrange: Criar carga com status inicial REGISTRADA
    const carga = CargaQuimica.create({
      produtoId: 'prod-uuid-123',
      quantidade: 500,
      responsavelTecnicoId: 'rtc-uuid-456'
    });

    // Act: Tentar liberar sem anexar a documentação necessária
    const resultado = carga.liberar();

    // Assert: O resultado deve indicar falha (Left)
    expect(resultado.isLeft()).toBe(true);
    expect(resultado.value).toBeInstanceOf(DomainError);
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
  });

  it('não deve permitir alterar o status de uma carga CANCELADA [RN-CRQ-11]', () => {
    // Arrange
    const carga = CargaQuimica.create({
      produtoId: 'prod-uuid-123',
      quantidade: 500,
      responsavelTecnicoId: 'rtc-uuid-456'
    });

    carga.cancelar('Cancelamento solicitado pelo cliente');

    // Act
    const resultado = carga.liberar();

    // Assert: Estado terminal bloqueia transições
    expect(resultado.isLeft()).toBe(true);
    expect(carga.status).toBe(StatusCarga.CANCELADA);
  });
});
````
6.4 Automação e Qualidade de Código (CI/CD)
    1.Linter e Formatação: Uso do ESLint com regras estritas do TypeScript e Prettier para padronização de código.

    2.Hook de Commit (Husky): Validação automática de tipos (tsc --noEmit) e execução de testes unitários rápidos antes de autorizar qualquer git commit.

    3.Métrica de Cobertura (Code Coverage): Meta de mínimo de 85% de cobertura de linhas na camada de domain e application.