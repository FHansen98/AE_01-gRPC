import time
import grpc
import datetime
from concurrent import futures

# Importando os módulos gerados pelo protoc
# Nota: Estes módulos serão gerados após executar o comando protoc
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
    
    def UnaryCall(self, request, context):
        """
        Implementação do método UnaryCall (Unary RPC)
        Uma única requisição, uma única resposta
        """
        print(f"Recebida requisição unária: {request.message}, número: {request.number}")
        
        # Processa a requisição
        response = service_pb2.SimpleResponse(
            message=f"Processado: {request.message}",
            processed_count=1,
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
    
    # Escuta na porta 50051
    server.add_insecure_port('[::]:50051')
    server.start()
    
    print("Servidor Unary RPC iniciado na porta 50051...")
    
    try:
        # Mantém o servidor rodando até ser interrompido
        while True:
            time.sleep(86400)  # 1 dia em segundos
    except KeyboardInterrupt:
        server.stop(0)
        print("Servidor encerrado.")

if __name__ == '__main__':
    serve()
