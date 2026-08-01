# ⚓ QuimiPort — Gestão de Cargas Químicas Portuárias

> **Tech Challenge — Fase 1 | Pós-Tech em Full Stack Development**  
> Proposta técnica de arquitetura de software, Domain-Driven Design (DDD) e especificação técnica para o controle de conformidade de cargas perigosas no ambiente portuário.

---

## 📌 Sobre o Projeto

O **QuimiPort** é uma solução arquitetural projetada para gerenciar o ciclo de vida e garantir a segurança operacional na movimentação de cargas químicas em terminais portuários (inspirado nas operações do Porto de Santos).

A aplicação atua como um motor rígido de conformidade, impedindo que cargas com documentação pendente, produtos inativos ou inspeções reprovadas entrem em movimentação no pátio.

---

## 🏗️ Arquitetura e Tecnologias Planejadas

O projeto adota os princípios de **Clean Architecture** e **DDD (Domain-Driven Design)**, segregando o núcleo de negócio de detalhes de infraestrutura.

* **Linguagem Principal:** TypeScript
* **Paradigma:** Orientação a Objetos + Programação Funcional (Pattern Either)
* **Arquitetura:** Clean Architecture / Layered Architecture
* **Banco de Dados (Fase 2):** PostgreSQL `[DECISÃO A VALIDAR PELA EQUIPE]`
* **Framework Web (Fase 2):** NestJS / Fastify `[DECISÃO A VALIDAR PELA EQUIPE]`

---

## 🗺️ Índice de Navegação da Documentação

Acesse os documentos detalhados de cada módulo da solução:

1. [📘 Domínio e Contexto](docs/1_dominio.md)
   * Contexto, problema, objetivos, atores/perfis e linguagem ubíqua.
2. [🧩 Modelagem com DDD](docs/2_modelagem_DDD.md)
   * Entidades, Objetos de Valor (VOs), Agregados e Invariantes do sistema.
3. [📋 Casos de Uso e Fluxos](docs/3_casos_de_uso.md)
   * Especificação dos Casos de Uso (UC-001 ao UC-008) e Matriz de Transição de Status.
4. [⚖️ Regras de Negócio](docs/4_regras_de_negocio.md)
   * Levantamento e alocação arquitetural das regras (RN-001 à RN-015).
5. [🏛️ Arquitetura e Design Técnico](docs/5_arquitetura.md)
   * Clean Architecture, estrutura de pastas, exemplos TypeScript, ADRs e Roadmap.
6. [🧪 Plano de Qualidade e Testes](docs/6_estrutura_de_testes.md)
   * Pirâmide de testes e matriz de cenários de teste do domínio.

---

## 👥 Autores & Equipe

* **Integrantes:** `[INSIRA O NOME DOS INTEGRANTES E RMS DA EQUIPE]`
* **Curso:** Pós-Tech em Full Stack Development
* **Instituição:** FIAP