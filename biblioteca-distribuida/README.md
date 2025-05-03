# Biblioteca Distribuída - Sistema de Gerenciamento com gRPC

Este projeto implementa um sistema distribuído de gerenciamento de biblioteca utilizando gRPC para comunicação entre os componentes, conforme a arquitetura especificada.

## Arquitetura

O sistema é composto por três módulos principais:

1. **Módulo P (Python)**: Web Server + gRPC Stub
   - Implementa uma API REST para clientes web
   - Atua como stub gRPC para se comunicar com os servidores A e B
   - Fornece uma interface web para interação com o sistema

2. **Módulo A (Go)**: gRPC Server para gerenciamento de livros
   - Implementa serviços para gerenciar o catálogo de livros
   - Oferece operações CRUD para livros
   - Implementa streaming de servidor para busca por categoria

3. **Módulo B (Node.js)**: gRPC Server para gerenciamento de usuários e empréstimos
   - Implementa serviços para gerenciar usuários
   - Implementa serviços para gerenciar empréstimos de livros
   - Oferece streaming bidirecional para atualizações de status

## Estrutura do Projeto

```
/biblioteca-distribuida/
  /proto/
    biblioteca.proto       # Definição dos serviços e mensagens gRPC
  /server-p/               # Módulo P (Python)
    app.py                 # Servidor web Flask + Stub gRPC
    biblioteca_pb2.py      # Código gerado pelo protoc
    biblioteca_pb2_grpc.py # Código gerado pelo protoc
    requirements.txt       # Dependências Python
    /templates/            # Templates HTML
    /static/               # Arquivos estáticos (CSS, JS)
  /server-a/               # Módulo A (Go)
    main.go                # Servidor gRPC para livros
    go.mod                 # Dependências Go
    /proto/                # Código gerado pelo protoc para Go
  /server-b/               # Módulo B (Node.js)
    server.js              # Servidor gRPC para usuários e empréstimos
    package.json           # Dependências Node.js
```

## Funcionalidades

### Gerenciamento de Livros (Servidor A)
- Cadastro, consulta, atualização e remoção de livros
- Busca de livros por categoria (streaming)

### Gerenciamento de Usuários e Empréstimos (Servidor B)
- Cadastro, consulta, atualização e remoção de usuários
- Registro de empréstimos e devoluções
- Consulta de empréstimos por usuário
- Listagem de empréstimos atrasados (streaming)
- Atualização de status de empréstimos (streaming bidirecional)

### Interface Web (Servidor P)
- Interface amigável para gerenciamento de livros, usuários e empréstimos
- API REST para integração com outros sistemas

## Requisitos

### Servidor P (Python)
- Python 3.8+
- Flask
- gRPC

### Servidor A (Go)
- Go 1.16+
- gRPC para Go

### Servidor B (Node.js)
- Node.js 14+
- gRPC para Node.js

## Como Executar

### 1. Instalar Dependências

Para o servidor P (Python):
```bash
cd server-p
pip install -r requirements.txt
```

Para o servidor A (Go):
```bash
cd server-a
go mod download
```

Para o servidor B (Node.js):
```bash
cd server-b
npm install
```

### 2. Iniciar os Servidores

Inicie o servidor A (Go):
```bash
cd server-a
go run main.go
```

Inicie o servidor B (Node.js):
```bash
cd server-b
node server.js
```

Inicie o servidor P (Python):
```bash
cd server-p
python app.py
```

### 3. Acessar a Interface Web

Abra o navegador e acesse:
```
http://localhost:5000
```

## Comunicação gRPC

Este projeto demonstra diferentes tipos de comunicação gRPC:

1. **Unary RPC**: Maioria das operações CRUD básicas
2. **Server Streaming RPC**: Busca de livros por categoria, listagem de empréstimos atrasados
3. **Bidirectional Streaming RPC**: Atualização de status de empréstimos

## Autores

- Desenvolvido como projeto para a disciplina de Programação de Sistemas Paralelos e Distribuídos
