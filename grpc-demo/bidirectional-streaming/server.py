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
    
    def BidirectionalStreamingCall(self, request_iterator, context):
        """
        Implementação do método BidirectionalStreamingCall (Bidirectional Streaming RPC)
        Múltiplas requisições em streaming, múltiplas respostas em streaming
        """
        # Processa cada requisição recebida do cliente em streaming
        # e envia respostas de volta em streaming
        for request in request_iterator:
            print(f"Recebida requisição bidirecional #{request.sequence_number}: {request.message}")
            
            # Cria uma resposta para cada requisição
            response = service_pb2.StreamResponse(
                message=f"Resposta para: {request.message}",
                sequence_number=request.sequence_number,
                timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
            )
            
            # Pausa para simular processamento
            time.sleep(0.5)
            
            # Envia a resposta para o cliente
            yield response

def serve():
    # Cria um servidor gRPC com 10 workers
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Adiciona o servicer ao servidor
    service_pb2_grpc.add_CommunicationDemoServicer_to_server(
        CommunicationDemoServicer(), server
    )
    
    # Escuta na porta 50054
    server.add_insecure_port('[::]:50054')
    server.start()
    
    print("Servidor Bidirectional Streaming RPC iniciado na porta 50054...")
    
    try:
        # Mantém o servidor rodando até ser interrompido
        while True:
            time.sleep(86400)  # 1 dia em segundos
    except KeyboardInterrupt:
        server.stop(0)
        print("Servidor encerrado.")

if __name__ == '__main__':
    serve()
