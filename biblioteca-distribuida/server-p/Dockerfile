FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY server-p/requirements.txt .

RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

COPY server-p/ ./
COPY proto/ ./proto/

RUN python -m grpc_tools.protoc \
    -I./proto \
    --python_out=. \
    --grpc_python_out=. \
    ./proto/biblioteca.proto

EXPOSE 5000

CMD ["python", "app.py"]