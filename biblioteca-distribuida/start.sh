#!/bin/bash

# Script para iniciar todos os componentes da aplicação distribuída

echo "Iniciando a aplicação Biblioteca Distribuída..."
echo "------------------------------------------------"

# Verificar se os diretórios existem
if [ ! -d "server-a" ] || [ ! -d "server-b" ] || [ ! -d "server-p" ]; then
    echo "Erro: Diretórios dos servidores não encontrados!"
    exit 1
fi

# Iniciar servidor A (Go) em background
echo "Iniciando Servidor A (Go) - Gerenciamento de Livros..."
cd server-a
go run main.go &
SERVER_A_PID=$!
cd ..
echo "Servidor A iniciado com PID: $SERVER_A_PID"
echo "------------------------------------------------"

# Aguardar um pouco para o servidor A iniciar
sleep 2

# Iniciar servidor B (Node.js) em background
echo "Iniciando Servidor B (Node.js) - Gerenciamento de Usuários e Empréstimos..."
cd server-b
node server.js &
SERVER_B_PID=$!
cd ..
echo "Servidor B iniciado com PID: $SERVER_B_PID"
echo "------------------------------------------------"

# Aguardar um pouco para o servidor B iniciar
sleep 2

# Iniciar servidor P (Python) em foreground
echo "Iniciando Servidor P (Python) - Web Server + gRPC Stub..."
cd server-p
source ../venv/bin/activate
python app.py
cd ..

# Esta parte só será executada quando o servidor P for encerrado
echo "Encerrando todos os servidores..."
kill $SERVER_A_PID
kill $SERVER_B_PID
echo "Aplicação encerrada!"
