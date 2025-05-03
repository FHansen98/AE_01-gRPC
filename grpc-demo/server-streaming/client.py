import grpc
import sys
import os

# Adiciona o diretório raiz ao path para importar os módulos gerados
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Estes imports funcionarão após gerar os arquivos com protoc
import service_pb2
import service_pb2_grpc

def run():
    # Cria um canal inseguro para o servidor na porta 50052
    with grpc.insecure_channel('localhost:50052') as channel:
        # Cria um stub (cliente)
        stub = service_pb2_grpc.CommunicationDemoStub(channel)
        
        # Prepara a requisição
        request = service_pb2.SimpleRequest(
            message="Olá do cliente Server Streaming RPC",
            number=5  # Solicita 5 respostas em streaming
        )
        
        print("Enviando requisição para streaming de servidor...")
        
        # Faz a chamada RPC de streaming de servidor
        # Isso retorna um iterador de respostas
        responses = stub.ServerStreamingCall(request)
        
        # Processa cada resposta recebida em streaming
        for response in responses:
            print(f"Resposta recebida #{response.sequence_number}: {response.message}")
            print(f"Timestamp: {response.timestamp}")
            print("-" * 50)

if __name__ == '__main__':
    run()
