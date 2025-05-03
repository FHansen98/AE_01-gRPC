import grpc
import sys
import os
import time

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
        "Primeira mensagem do cliente",
        "Segunda mensagem do cliente",
        "Terceira mensagem do cliente",
        "Quarta mensagem do cliente",
        "Quinta mensagem do cliente"
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
        time.sleep(0.5)

def run():
    # Cria um canal inseguro para o servidor na porta 50053
    with grpc.insecure_channel('localhost:50053') as channel:
        # Cria um stub (cliente)
        stub = service_pb2_grpc.CommunicationDemoStub(channel)
        
        print("Iniciando envio de requisições em streaming para o servidor...")
        
        # Faz a chamada RPC de streaming de cliente
        # Envia múltiplas requisições e recebe uma única resposta
        response = stub.ClientStreamingCall(generate_requests())
        
        # Processa a resposta única recebida
        print("\nResposta recebida do servidor:")
        print(f"Mensagem: {response.message}")
        print(f"Contagem processada: {response.processed_count}")
        print(f"Sucesso: {response.success}")

if __name__ == '__main__':
    run()
