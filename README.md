# 💰 API de Controle de Despesas

> API de controle financeiro pessoal com CRUD completo, filtros por categoria/data e relatórios estatísticos utilizando NestJS, Prisma e PostgreSQL.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.8-blue.svg)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Docker-blue.svg)](https://postgresql.org)

---

## 📋 **Pré-requisitos**

Antes de começar, certifique-se de ter instalado:

- **Node.js 18+** ([Download](https://nodejs.org))
- **Docker** e **Docker Compose** ([Download](https://docker.com))
- **VS Code** com extensão **REST Client** (recomendado para testes)

---

## 🚀 **Como Executar**

### **1. Clone e Instale**

```bash
git clone <url-do-repositorio>
cd api-despesas
npm install
```

### ⚙️ **2. Configure as Variáveis de Ambiente**

```bash
# Copiar arquivos de exemplo
cp .env.exemplo .env
cp .env.test.exemplo .env.test
```

💡 Edite os arquivos se necessário:

.env - Configurações de desenvolvimento
.env.test - Configurações para testes E2E

### **3. Execute a Aplicação** 🎯

```bash
npm run launch:app
```

**Pronto!** A API estará rodando em: `http://localhost:3000`

> 💡 **O que o `launch:app` faz:**
>
> - Configura PostgreSQL via Docker
> - Executa migrações do banco
> - Popula dados de exemplo
> - Inicia servidor em modo desenvolvimento

---

## ⚙️ **Variáveis de Ambiente**

### **Arquivo `.env` (Desenvolvimento)**

```env
# Banco de dados principal
DATABASE_URL="postgresql://despesas_user:despesas_pass@localhost:5432/despesas_db"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"

# Servidor
PORT=3000
NODE_ENV=development
```

### **Arquivo `.env.test` (Testes)**

```env
# Banco de dados de teste
DATABASE_URL="postgresql://despesas_user:despesas_pass@localhost:5433/despesas_test_db"

# JWT para testes
JWT_SECRET="jwt-secret-para-testes"

# Configurações de teste
PORT=3001
NODE_ENV=test
```

> ⚠️ **Importante**: Os arquivos `.env` são ignorados pelo Git. Use os arquivos `.env.exemplo` como base.

---

## 🧪 **Como Testar a API**

### **Método 1: Arquivo REST (Recomendado)** 🎯

1. **Abra o VS Code** e instale a extensão **REST Client**
2. **Abra o arquivo**: `test-api.http` (na raiz do projeto)
3. **Execute o primeiro request** (#1 - Login) clicando em "Send Request"
4. O próprio request de login já salva o Token pra você!
5. **Execute outros requests** clicando em "Send Request"

```http
### Exemplo do arquivo test-api.http
@baseUrl = http://localhost:3000
@token = SEU_TOKEN_JWT_AQUI

### 1. Login (Execute PRIMEIRO!)
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@expenses.com",
  "password": "admin123"
}

### 2. Listar todas as despesas
GET {{baseUrl}}/despesas

### 3. Criar nova despesa (usa token automaticamente)
POST {{baseUrl}}/despesas
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Almoço no Restaurante",
  "amount": 35.90,
  "category": "ALIMENTACAO",
  "date": "2025-05-28"
}
```

### **Método 2: Swagger UI** 📖

1. Acesse: `http://localhost:3000/api/docs`
2. Clique em **"Try it out"** nos endpoints
3. Para endpoints protegidos:
   - Faça login primeiro
   - Clique no botão **"Authorize"**
   - Digite: `Bearer SEU_TOKEN_AQUI`

### **Método 3: cURL**

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@expenses.com","password":"admin123"}'

# 2. Listar despesas
curl http://localhost:3000/despesas

# 3. Criar despesa (substitua SEU_TOKEN)
curl -X POST http://localhost:3000/despesas \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste","amount":25.50,"category":"OUTROS","date":"2025-05-28"}'
```

---

## 📁 **Arquivos Importantes**

### **🧪 Para Testes**

- **`test-api.http`** - Arquivo REST com todos os endpoints (VS Code)
- **`test/`** - Pasta com testes automatizados E2E
- **Swagger UI** - `http://localhost:3000/api/docs`

### **⚙️ Para Configuração**

- **`scripts/`** - Scripts bash de automação
- **`docker-compose.yml`** - Configuração do PostgreSQL
- **`prisma/schema.prisma`** - Schema do banco de dados

---

## 📊 **Endpoints Principais**

### **🔐 Autenticação**

```http
POST /auth/login
# Credenciais padrão: admin@expenses.com / admin123
```

### **💰 Despesas (Públicos)**

```http
GET /despesas                                    # Todas as despesas
GET /despesas?mes=05                            # Maio de qualquer ano
GET /despesas?ano=2025                          # Todo o ano 2025
GET /despesas?categoria=ALIMENTACAO             # Por categoria
GET /despesas?mes=05&ano=2025&categoria=LAZER   # Filtros combinados
GET /despesas/estatisticas                      # Relatórios
GET /despesas/:id                               # Por ID
```

### **💰 Despesas (Protegidos - Requer Token)**

```http
POST /despesas      # Criar
PATCH /despesas/:id # Atualizar
DELETE /despesas/:id # Excluir
```

### **📂 Categorias Disponíveis**

- `ALIMENTACAO` - Comida e bebidas
- `TRANSPORTE` - Combustível, transporte público
- `LAZER` - Entretenimento, diversão
- `SAUDE` - Medicamentos, consultas
- `OUTROS` - Demais despesas

---

## 🧪 **Executar Testes**

### **Testes Unitários**

```bash
npm test
```

### **Testes E2E (Integração)**

```bash
npm run launch:e2e
```

> ⚠️ **Importante**: Este comando configura um ambiente de teste separado

### **Localização dos Testes**

- **Unitários**: `src/**/*.spec.ts`
- **E2E**: `test/**/*.e2e-spec.ts`

---

## 🗄️ **Banco de Dados**

### **Visualizar Dados**

```bash
npm run prisma:studio
```

Acesse: `http://localhost:5555`

### **Gerenciar Banco**

```bash
npm run setup       # Configurar banco
npm run seed        # Popular com dados exemplo
npm run teardown    # Parar serviços
```

---

## 🔧 **Scripts Disponíveis**

### **🚀 Launchers (Principais)**

```bash
npm run launch:app    # 🎯 Iniciar aplicação completa
npm run launch:e2e    # 🧪 Executar testes E2E
```

### **⚙️ Desenvolvimento**

```bash
npm run start:dev     # Servidor com hot-reload
npm run build         # Compilar para produção
npm run start:prod    # Executar versão produção
```

### **🗄️ Banco de Dados**

```bash
npm run setup         # Configurar PostgreSQL
npm run seed          # Popular dados exemplo
npm run teardown      # Parar todos serviços
npm run teardown:clean # Reset completo (⚠️ apaga tudo)
npm run prisma:studio # Interface visual do banco
```

### **🧪 Testes**

```bash
npm test              # Testes unitários
npm run test:e2e      # Testes de integração
```

---

## ✅ **Checklist de Validação**

Após executar `npm run launch:app`, verifique:

- [ ] ✅ API responde em `http://localhost:3000`
- [ ] 📖 Swagger acessível em `http://localhost:3000/api/docs`
- [ ] 🔐 Login funciona com `admin@expenses.com / admin123`
- [ ] 📊 Endpoint `/despesas` retorna dados
- [ ] 🗄️ Prisma Studio conecta em `http://localhost:5555`
- [ ] 🧪 Arquivo `test-api.http` executa requests

---

## 🐛 **Resolução de Problemas**

### **❌ Porta já em uso**

```bash
# Matar processo na porta 3000
kill -9 $(lsof -ti:3000)
```

### **❌ Erro de banco**

```bash
# Reset completo
npm run teardown:clean
npm run launch:app
```

### **❌ Docker não funciona**

```bash
# Verificar Docker
docker --version
docker-compose --version

# Ver containers ativos
docker ps
```

---

## 📞 **Suporte**

- 📖 **Documentação**: `http://localhost:3000/api/docs`
- 🧪 **Testes**: Use arquivo `test-api.http`
- 🗄️ **Dados**: Prisma Studio `http://localhost:5555`

---

**Desenvolvido por Vinícius Rassl**  
**Stack**: NestJS + Prisma + PostgreSQL + Docker
