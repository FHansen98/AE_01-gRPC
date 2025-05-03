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
    
    def ClientStreamingCall(self, request_iterator, context):
        """
        Implementação do método ClientStreamingCall (Client Streaming RPC)
        Múltiplas requisições em streaming, uma única resposta
        """
        count = 0
        messages = []
        
        # Processa cada requisição recebida do cliente em streaming
        for request in request_iterator:
            print(f"Recebida requisição #{request.sequence_number}: {request.message}")
            count += 1
            messages.append(request.message)
        
        # Após receber todas as requisições, envia uma única resposta
        response = service_pb2.SimpleResponse(
            message=f"Processadas {count} mensagens: {', '.join(messages)}",
            processed_count=count,
            success=True
        )
        
        return response

def serve():
    # Cria um servidor gRPC com 10 workers
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # Adiciona o servicer ao servidor
    service_pb2_grpc.add_CommunicationDemoServicer_to_server(
        CommunicationDemoServicer(), server
    )
    
    # Escuta na porta 50053
    server.add_insecure_port('[::]:50053')
    server.start()
    
    print("Servidor Client Streaming RPC iniciado na porta 50053...")
    
    try:
        # Mantém o servidor rodando até ser interrompido
        while True:
            time.sleep(86400)  # 1 dia em segundos
    except KeyboardInterrupt:
        server.stop(0)
        print("Servidor encerrado.")

if __name__ == '__main__':
    serve()
