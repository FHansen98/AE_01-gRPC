FROM golang:1.19-alpine AS builder

RUN apk add --no-cache git protobuf protobuf-dev

RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

WORKDIR /app

COPY proto/ /app/proto/

COPY server-a/ /app/

RUN mkdir -p proto

RUN protoc --go_out=. --go_opt=paths=source_relative \
    --go-grpc_out=. --go-grpc_opt=paths=source_relative \
    proto/biblioteca.proto
RUN go mod tidy
RUN go mod download

RUN go build -o main .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 50051
CMD ["./main"]