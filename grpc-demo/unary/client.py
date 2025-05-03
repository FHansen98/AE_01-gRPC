import grpc
import sys
import os

# Adiciona o diretório raiz ao path para importar os módulos gerados
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Estes imports funcionarão após gerar os arquivos com protoc
import service_pb2
import service_pb2_grpc

def run():
    # Cria um canal inseguro para o servidor na porta 50051
    with grpc.insecure_channel('localhost:50051') as channel:
        # Cria um stub (cliente)
        stub = service_pb2_grpc.CommunicationDemoStub(channel)
        
        # Prepara a requisição
        request = service_pb2.SimpleRequest(
            message="Olá do cliente Unary RPC",
            number=42
        )
        
        print("Enviando requisição unária...")
        
        # Faz a chamada RPC unária
        response = stub.UnaryCall(request)
        
        # Processa a resposta
        print(f"Resposta recebida: {response.message}")
        print(f"Contagem processada: {response.processed_count}")
        print(f"Sucesso: {response.success}")

if __name__ == '__main__':
    run()
