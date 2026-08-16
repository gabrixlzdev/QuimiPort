# 6. PLANO DE QUALIDADE E TESTES DE SOFTWARE

## 6.1 Estratégia

O QuimiPort usará Vitest ou Jest no ecossistema Node.js/TypeScript. A maior parte da cobertura ficará no domínio, com testes rápidos e determinísticos; integrações confirmarão persistência e contratos; poucos E2E validarão jornadas críticas pela API.

```text
          / E2E \          jornadas críticas pela API
         /-------\
        /Integração\       casos de uso, repositórios e banco
       /-----------\
      /  Unitários  \      entidades, VOs, funções puras e estados
```

O relógio será injetado nos casos que dependem de validade. Assim, testes de vencimento não dependem da data real da máquina.

## 6.2 Matriz regra de negócio → nível de teste

Legenda: **X** = cobertura obrigatória; **—** = não agrega confiança proporcional nesta fase.

| Regras | Comportamento protegido | Unitário | Integração | E2E |
| :--- | :--- | :---: | :---: | :---: |
| RN-PRQ-01, RN-CRQ-01, RN-RTC-01, RN-DOC-01, RN-INS-01, RN-ARM-01 | Geração e persistência de identificadores | — | X | — |
| RN-PRQ-02, RN-PRQ-03, RN-PRQ-04 | Nome, classificação de risco e estado inicial do produto | X | — | — |
| RN-PRQ-05, RN-CRQ-02, RN-CRQ-08 | Produto inativo não entra em nova carga | X | X | X |
| RN-PRQ-06 | Unicidade de nome e classe de risco | X | X | — |
| RN-PRQ-07 | Inativação exige aprovação superior | X | X | X |
| RN-CRQ-03 | Quantidade maior que zero | X | — | — |
| RN-CRQ-04, RN-CRQ-05 | Carga inicia registrada e com responsável técnico | X | X | — |
| RN-CRQ-06 | Associação de múltiplos documentos | X | X | — |
| RN-CRQ-07 | Liberação exige inspeção aprovada | X | X | X |
| RN-CRQ-09, RN-DOC-02, RN-DOC-03, RN-DOC-04, RN-DOC-05 | Checklist obrigatório, status documental e vigência calculada | X | X | X |
| RN-CRQ-10 | Carga bloqueada não se movimenta nem é liberada | X | X | X |
| RN-CRQ-11 | Carga cancelada é terminal | X | — | X |
| RN-CRQ-12 | Registro retroativo exige aprovação superior | X | X | X |
| RN-RTC-02, RN-RTC-03 | CPF e registro profissional válidos | X | — | — |
| RN-INS-02, RN-INS-03, RN-INS-04 | Carga, data e inspetor obrigatórios na inspeção | X | X | — |
| RN-ARM-02, RN-ARM-03, RN-ARM-04, RN-ARM-05 | Estado, carga, ocupação e capacidade da área | X | X | — |

As jornadas E2E prioritárias são: registrar carga com produto ativo; rejeitar produto inativo; validar documentos e impedir documento vencido; registrar inspeção aprovada e liberar formalmente; bloquear carga e impedir movimentação; cancelar carga e impedir novas transições.

## 6.3 Cenários unitários essenciais

| Regra | Cenário | Resultado |
| :--- | :--- | :--- |
| RN-PRQ-03 | Criar classificação com ONU inválido | `Left<ClassificacaoRiscoInvalidaError>` |
| RN-CRQ-03 | Criar quantidade menor ou igual a zero | `Left<QuantidadeInvalidaError>` |
| RN-DOC-05 | Documento validado com validade anterior ao relógio injetado | `estaVencido` retorna `true` e a liberação falha |
| RN-CRQ-07 | Liberar com inspeção pendente ou reprovada | Estado permanece `EM_INSPECAO` ou `BLOQUEADA` |
| RN-CRQ-09 | Liberar sem tipo obrigatório ou com documento rejeitado | `Left` específico e estado inalterado |
| RN-CRQ-10 | Movimentar carga bloqueada | `Left<CargaBloqueadaError>` |
| RN-CRQ-11 | Alterar carga cancelada | `Left<CargaCanceladaError>` |
| RN-RTC-02 | Criar CPF com dígitos inválidos | `Left<CPFInvalidoError>` |
| RN-ARM-05 | Alocar acima da capacidade | `Left<CapacidadeExcedidaError>` |

## 6.4 Exemplo TypeScript

```typescript
import { describe, expect, it } from 'vitest';

describe('liberação de carga', () => {
  it('impede liberação quando um documento validado venceu [RN-CRQ-09, RN-DOC-05]', () => {
    const agora = new Date('2026-08-16T12:00:00Z');
    const carga = cargaEmInspecaoAprovada({
      documento: documentoValidado({
        dataValidade: new Date('2026-08-15T23:59:59Z'),
      }),
    });

    const resultado = carga.liberar(agora);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoVencidoError);
    }
    expect(carga.status).toBe(StatusCarga.EM_INSPECAO);
  });
});
```

O teste evidencia a decisão: `EXPIRADO` não é estado do documento; a vigência é calculada no momento da liberação.

## 6.5 Qualidade e automação

- ESLint, Prettier e `tsc --noEmit` verificam padrão e contratos.
- O pipeline executa unitários primeiro, depois integração e E2E.
- A meta inicial é 85% de cobertura de linhas em `domain` e `application`, sem substituir a matriz de regras por uma métrica numérica.
- Testes de integração usam banco isolado; testes E2E exercitam a API sem depender de serviços externos reais.
