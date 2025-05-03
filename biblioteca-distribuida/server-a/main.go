package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"sync"
	"time"

	"github.com/google/uuid"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	pb "biblioteca-server-a/proto"
)

var (
	port = flag.Int("port", 50051, "The server port")
)

// Servidor para gerenciamento de livros
type bookServer struct {
	pb.UnimplementedBookServiceServer
	mu    sync.Mutex
	books map[string]*pb.Book
}

// Inicializa o servidor com alguns livros de exemplo
func newBookServer() *bookServer {
	s := &bookServer{
		books: make(map[string]*pb.Book),
	}

	// Adicionar alguns livros de exemplo
	books := []*pb.Book{
		{
			Id:        uuid.New().String(),
			Title:     "Dom Casmurro",
			Author:    "Machado de Assis",
			Category:  "Ficção",
			Year:      1899,
			Available: true,
		},
		{
			Id:        uuid.New().String(),
			Title:     "O Senhor dos Anéis",
			Author:    "J.R.R. Tolkien",
			Category:  "Ficção",
			Year:      1954,
			Available: true,
		},
		{
			Id:        uuid.New().String(),
			Title:     "Algoritmos: Teoria e Prática",
			Author:    "Thomas H. Cormen",
			Category:  "Técnico",
			Year:      2009,
			Available: true,
		},
		{
			Id:        uuid.New().String(),
			Title:     "Clean Code",
			Author:    "Robert C. Martin",
			Category:  "Técnico",
			Year:      2008,
			Available: true,
		},
		{
			Id:        uuid.New().String(),
			Title:     "Breve História do Tempo",
			Author:    "Stephen Hawking",
			Category:  "Ciência",
			Year:      1988,
			Available: true,
		},
	}

	for _, book := range books {
		s.books[book.Id] = book
	}

	return s
}

// GetAllBooks retorna todos os livros
func (s *bookServer) GetAllBooks(ctx context.Context, empty *pb.Empty) (*pb.BookList, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Println("[GetAllBooks] Retornando todos os livros")

	books := make([]*pb.Book, 0, len(s.books))
	for _, book := range s.books {
		books = append(books, book)
	}

	return &pb.BookList{Books: books}, nil
}

// GetBook retorna um livro pelo ID
func (s *bookServer) GetBook(ctx context.Context, req *pb.BookId) (*pb.Book, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Printf("[GetBook] Buscando livro com ID: %s\n", req.Id)

	book, ok := s.books[req.Id]
	if !ok {
		return nil, status.Errorf(codes.NotFound, "Livro não encontrado com ID: %s", req.Id)
	}

	return book, nil
}

// AddBook adiciona um novo livro
func (s *bookServer) AddBook(ctx context.Context, req *pb.Book) (*pb.BookResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Printf("[AddBook] Adicionando novo livro: %s por %s\n", req.Title, req.Author)

	// Gerar um novo ID para o livro
	id := uuid.New().String()
	book := &pb.Book{
		Id:        id,
		Title:     req.Title,
		Author:    req.Author,
		Category:  req.Category,
		Year:      req.Year,
		Available: true,
	}

	s.books[id] = book

	return &pb.BookResponse{
		Success: true,
		Message: "Livro adicionado com sucesso",
		Book:    book,
	}, nil
}

// UpdateBook atualiza um livro existente
func (s *bookServer) UpdateBook(ctx context.Context, req *pb.Book) (*pb.BookResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Printf("[UpdateBook] Atualizando livro com ID: %s\n", req.Id)

	book, ok := s.books[req.Id]
	if !ok {
		return &pb.BookResponse{
			Success: false,
			Message: fmt.Sprintf("Livro não encontrado com ID: %s", req.Id),
		}, nil
	}

	// Atualizar os campos do livro
	book.Title = req.Title
	book.Author = req.Author
	book.Category = req.Category
	book.Year = req.Year
	book.Available = req.Available

	return &pb.BookResponse{
		Success: true,
		Message: "Livro atualizado com sucesso",
		Book:    book,
	}, nil
}

// DeleteBook remove um livro
func (s *bookServer) DeleteBook(ctx context.Context, req *pb.BookId) (*pb.BookResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Printf("[DeleteBook] Removendo livro com ID: %s\n", req.Id)

	book, ok := s.books[req.Id]
	if !ok {
		return &pb.BookResponse{
			Success: false,
			Message: fmt.Sprintf("Livro não encontrado com ID: %s", req.Id),
		}, nil
	}

	delete(s.books, req.Id)

	return &pb.BookResponse{
		Success: true,
		Message: "Livro removido com sucesso",
		Book:    book,
	}, nil
}

// GetBooksByCategory retorna livros por categoria (streaming)
func (s *bookServer) GetBooksByCategory(req *pb.Category, stream pb.BookService_GetBooksByCategoryServer) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	log.Printf("[GetBooksByCategory] Buscando livros da categoria: %s\n", req.Name)

	for _, book := range s.books {
		if book.Category == req.Name {
			if err := stream.Send(book); err != nil {
				return err
			}
			// Pequeno delay para simular processamento
			time.Sleep(100 * time.Millisecond)
		}
	}

	return nil
}

func main() {
	flag.Parse()
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", *port))
	if err != nil {
		log.Fatalf("Falha ao escutar: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterBookServiceServer(s, newBookServer())

	log.Printf("Servidor de livros iniciado na porta %d", *port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Falha ao servir: %v", err)
	}
}
