import grpc
import sys
import os
import time
import threading

# Adiciona o diretório raiz ao path para importar os módulos gerados
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Estes imports funcionarão após gerar os arquivos com protoc
import service_pb2
import service_pb2_grpc

def generate_requests():
    """
    Gerador que produz uma sequência de requisições para enviar ao servidor
    """
    messages = [
        "Mensagem bidirecional 1",
        "Mensagem bidirecional 2",
        "Mensagem bidirecional 3",
        "Mensagem bidirecional 4",
        "Mensagem bidirecional 5"
    ]
    
    for i, message in enumerate(messages, 1):
        # Cria uma requisição para cada mensagem
        request = service_pb2.StreamRequest(
            message=message,
            sequence_number=i
        )
        
        print(f"Enviando requisição #{i}: {message}")
        yield request
        
        # Pausa entre as requisições para simular processamento
        time.sleep(1)

def run():
    # Cria um canal inseguro para o servidor na porta 50054
    with grpc.insecure_channel('localhost:50054') as channel:
        # Cria um stub (cliente)
        stub = service_pb2_grpc.CommunicationDemoStub(channel)
        
        print("Iniciando streaming bidirecional com o servidor...")
        
        # Faz a chamada RPC de streaming bidirecional
        # Envia múltiplas requisições e recebe múltiplas respostas
        responses = stub.BidirectionalStreamingCall(generate_requests())
        
        # Processa cada resposta recebida em streaming
        for response in responses:
            print(f"\nResposta recebida #{response.sequence_number}: {response.message}")
            print(f"Timestamp: {response.timestamp}")
            print("-" * 50)

if __name__ == '__main__':
    run()
