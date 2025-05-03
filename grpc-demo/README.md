# gRPC Communication Types Demo

Este projeto demonstra os quatro tipos de comunicação suportados pelo gRPC:

1. **Unary RPC**: Uma única requisição e uma única resposta
2. **Server Streaming RPC**: Uma única requisição e múltiplas respostas em streaming
3. **Client Streaming RPC**: Múltiplas requisições em streaming e uma única resposta
4. **Bidirectional Streaming RPC**: Múltiplas requisições e múltiplas respostas em streaming

## Componentes do gRPC

### Protocol Buffers (protobuf)
Protocol Buffers é o mecanismo de serialização de dados estruturados usado pelo gRPC. Ele define:
- A estrutura das mensagens trocadas entre cliente e servidor
- A interface de serviço (métodos RPC)
- É independente de linguagem e plataforma

### HTTP/2
O gRPC utiliza HTTP/2 como protocolo de transporte, oferecendo:
- Multiplexação: múltiplas requisições/respostas simultâneas em uma única conexão TCP
- Header compression: redução do overhead de rede
- Streaming bidirecional: permite comunicação em tempo real
- Priorização de fluxos: melhor utilização dos recursos de rede

## Estrutura do Projeto

```
grpc-demo/
├── proto/                   # Definições Protocol Buffer
│   └── service.proto        # Interface do serviço gRPC
├── unary/                   # Exemplo de Unary RPC
│   ├── client.py            # Cliente Unary
│   └── server.py            # Servidor Unary
├── server-streaming/        # Exemplo de Server Streaming RPC
│   ├── client.py            # Cliente Server Streaming
│   └── server.py            # Servidor Server Streaming
├── client-streaming/        # Exemplo de Client Streaming RPC
│   ├── client.py            # Cliente Client Streaming
│   └── server.py            # Servidor Client Streaming
├── bidirectional-streaming/ # Exemplo de Bidirectional Streaming RPC
│   ├── client.py            # Cliente Bidirectional Streaming
│   └── server.py            # Servidor Bidirectional Streaming
└── requirements.txt         # Dependências do projeto
```

## Como executar

### Preparação do ambiente

1. Crie um ambiente virtual Python:
   ```bash
   python3 -m venv venv
   ```

2. Ative o ambiente virtual:
   ```bash
   source venv/bin/activate
   ```
   Você verá `(venv)` no início da linha de comando, indicando que o ambiente virtual está ativo.

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Gere o código a partir do arquivo .proto:
   ```bash
   python3 -m grpc_tools.protoc -I./proto --python_out=. --grpc_python_out=. ./proto/service.proto
   ```
   Isso criará os arquivos `service_pb2.py` e `service_pb2_grpc.py` necessários para a comunicação gRPC.

### Executando os exemplos

Para cada tipo de comunicação, você precisará de dois terminais: um para o servidor e outro para o cliente.

#### Terminal 1 (Servidor)

1. Ative o ambiente virtual (se ainda não estiver ativo):
   ```bash
   source venv/bin/activate
   ```

2. Execute o servidor para o tipo de comunicação desejado:
   ```bash
   python3 unary/server.py             # Para Unary RPC
   # OU
   python3 server-streaming/server.py   # Para Server Streaming RPC
   # OU
   python3 client-streaming/server.py   # Para Client Streaming RPC
   # OU
   python3 bidirectional-streaming/server.py  # Para Bidirectional Streaming RPC
   ```

#### Terminal 2 (Cliente)

1. Abra um novo terminal e navegue até o diretório do projeto

2. Ative o ambiente virtual:
   ```bash
   source venv/bin/activate
   ```

3. Execute o cliente correspondente ao servidor que está rodando:
   ```bash
   python3 unary/client.py             # Para Unary RPC
   # OU
   python3 server-streaming/client.py   # Para Server Streaming RPC
   # OU
   python3 client-streaming/client.py   # Para Client Streaming RPC
   # OU
   python3 bidirectional-streaming/client.py  # Para Bidirectional Streaming RPC
   ```

**Importante**: Certifique-se de que o servidor esteja rodando antes de executar o cliente correspondente.

## Conclusão

Cada tipo de comunicação do gRPC é adequado para diferentes cenários:

1. **Unary RPC**: Ideal para operações simples de requisição-resposta, como buscar um registro específico ou realizar uma operação atômica.

2. **Server Streaming RPC**: Útil quando o servidor precisa enviar uma grande quantidade de dados ou um fluxo contínuo, como download de arquivos, streaming de vídeo, ou monitoramento em tempo real.

3. **Client Streaming RPC**: Apropriado quando o cliente precisa enviar uma grande quantidade de dados ou um fluxo contínuo, como upload de arquivos ou envio de telemetria.

4. **Bidirectional Streaming RPC**: Perfeito para comunicação em tempo real onde tanto cliente quanto servidor precisam enviar dados de forma independente, como chat, jogos online ou sistemas de colaboração em tempo real.
