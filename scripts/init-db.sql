-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar schema public se não existir
CREATE SCHEMA IF NOT EXISTS public;

-- Dar permissões ao usuário postgres
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Log de inicialização
SELECT 'Database expenses_db initialized successfully' as status;
