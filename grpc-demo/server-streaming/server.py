import time
import grpc
import datetime
from concurrent import futures

# Importando os módulos gerados pelo protoc
import sys
import os

# Adiciona o diretório raiz ao path para importar os módulos gerados
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Estes imports funcionarão após gerar os arquivos com protoc
import service_pb2
import service_pb2_grpc

class CommunicationDemoServicer(service_pb2_grpc.CommunicationDemoServicer):
    """
    Implementação do servidor para o serviço CommunicationDemo
    """
    
    def ServerStreamingCall(self, request, context):
        """
        Implementação do método ServerStreamingCall (Server Streaming RPC)
        Uma única requisição, múltiplas respostas em streaming
        """
        print(f"Recebida requisição para streaming de servidor: {request.message}, número: {request.number}")
        
        # Simula o envio de múltiplas respostas em streaming
        for i in range(1, request.number + 1):
            # Cria uma resposta para cada iteração
            response = service_pb2.StreamResponse(
                message=f"Resposta em streaming {i} para: {request.message}",
                sequence_number=i,
                timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
            )
            
            # Envia a resposta para o cliente
            yield response
            
            # Pausa entre as respostas para simular processamento
            time.sleep(0.5)

def serve():
    # Cria um servidor gRPC com 10 workers
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Adiciona o servicer ao servidor
    service_pb2_grpc.add_CommunicationDemoServicer_to_server(
        CommunicationDemoServicer(), server
    )
    
    # Escuta na porta 50052
    server.add_insecure_port('[::]:50052')
    server.start()
    
    print("Servidor Server Streaming RPC iniciado na porta 50052...")
    
    try:
        # Mantém o servidor rodando até ser interrompido
        while True:
            time.sleep(86400)  # 1 dia em segundos
    except KeyboardInterrupt:
        server.stop(0)
        print("Servidor encerrado.")

if __name__ == '__main__':
    serve()
