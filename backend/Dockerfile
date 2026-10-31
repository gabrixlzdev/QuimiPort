# ==============================================================================
#  BUILDER (Ambiente de compilação da aplicação
# ==============================================================================

# Usa a imagem oficial do Node.js versão 24 - ~5 MB
FROM node:24-alpine AS builder

# cria pasta de trabalho interna no container onde os arquivos do projeto ficarão dentro do container
WORKDIR /app

# Copia apenas os manifestos package.json e package-lock.json primeiro.
# Isso aproveita o cache do Docker: se as dependências não mudaram, ele não baixa tudo de novo.
COPY package*.json ./

# Instala todas as dependências de forma idêntica e estrita ao package-lock.json (inclusive devDependencies)
RUN npm ci

# Copia todo o restante do código-fonte da pasta backend/ para dentro do container
COPY . .

# Executa o build do NestJS (compila todo o TypeScript para JavaScript puro dentro da pasta dist/)
RUN npm run build

# Remove as dependências de desenvolvimento (devDependencies como Vitest, Oxlint, Prettier),
# deixando apenas as bibliotecas essenciais de produção para a imagem final não ficar pesada.
RUN npm prune --omit=dev

# ==============================================================================
# RUNNER (Ambiente final de execução em produção)
# ==============================================================================

# Começa a partir de uma imagem Alpine limpa, descartando compiladores e arquivos temporários da Etapa 1
FROM node:24-alpine AS runner

WORKDIR /app

# Define a variável de ambiente para que o Node.js e frameworks rodem no modo otimizado de produção
ENV NODE_ENV=production

# Argumento e variável para a porta: assume 3000 por padrão, mas aceita override do .env/Compose
ARG PORT=3000
ENV PORT=${PORT}

# Copia da Etapa 1 (builder) apenas o que é estritamente necessário para rodar:
# 1. Os manifestos de versão
COPY --from=builder /app/package*.json ./
# 2. Apenas os módulos de produção
COPY --from=builder /app/node_modules ./node_modules
# 3. O código compilado em JavaScript
COPY --from=builder /app/dist ./dist

# Documenta a porta que este container expõe para a rede (dinâmica conforme PORT)
EXPOSE ${PORT}

# Comando final que liga o servidor NestJS quando o container é inicializado
CMD ["node", "dist/main.js"]
