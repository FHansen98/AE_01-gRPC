import os
import json
import grpc
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import biblioteca_pb2
import biblioteca_pb2_grpc

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Configurações dos servidores gRPC
SERVER_A_ADDRESS = os.getenv('SERVER_A_ADDRESS', 'localhost:50051')
SERVER_B_ADDRESS = os.getenv('SERVER_B_ADDRESS', 'localhost:50052')

# Stubs para comunicação com os servidores gRPC
def get_book_stub():
    channel = grpc.insecure_channel(SERVER_A_ADDRESS)
    return biblioteca_pb2_grpc.BookServiceStub(channel)

def get_user_stub():
    channel = grpc.insecure_channel(SERVER_B_ADDRESS)
    return biblioteca_pb2_grpc.UserServiceStub(channel)

def get_loan_stub():
    channel = grpc.insecure_channel(SERVER_B_ADDRESS)
    return biblioteca_pb2_grpc.LoanServiceStub(channel)

# Rotas para a interface web
@app.route('/')
def index():
    return render_template('index.html')

# API para livros
@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        stub = get_book_stub()
        response = stub.GetAllBooks(biblioteca_pb2.Empty())
        books = []
        for book in response.books:
            books.append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'category': book.category,
                'year': book.year,
                'available': book.available
            })
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/<book_id>', methods=['GET'])
def get_book(book_id):
    try:
        stub = get_book_stub()
        response = stub.GetBook(biblioteca_pb2.BookId(id=book_id))
        book = {
            'id': response.id,
            'title': response.title,
            'author': response.author,
            'category': response.category,
            'year': response.year,
            'available': response.available
        }
        return jsonify(book)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books', methods=['POST'])
def add_book():
    try:
        data = request.json
        stub = get_book_stub()
        book = biblioteca_pb2.Book(
            title=data['title'],
            author=data['author'],
            category=data['category'],
            year=data['year'],
            available=True
        )
        response = stub.AddBook(book)
        return jsonify({
            'success': response.success,
            'message': response.message,
            'book': {
                'id': response.book.id,
                'title': response.book.title,
                'author': response.book.author,
                'category': response.book.category,
                'year': response.book.year,
                'available': response.book.available
            } if response.success else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/<book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        data = request.json
        stub = get_book_stub()
        book = biblioteca_pb2.Book(
            id=book_id,
            title=data['title'],
            author=data['author'],
            category=data['category'],
            year=data['year'],
            available=data.get('available', True)
        )
        response = stub.UpdateBook(book)
        return jsonify({
            'success': response.success,
            'message': response.message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        stub = get_book_stub()
        response = stub.DeleteBook(biblioteca_pb2.BookId(id=book_id))
        return jsonify({
            'success': response.success,
            'message': response.message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/books/category/<category>', methods=['GET'])
def get_books_by_category(category):
    try:
        stub = get_book_stub()
        books = []
        for book in stub.GetBooksByCategory(biblioteca_pb2.Category(name=category)):
            books.append({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'category': book.category,
                'year': book.year,
                'available': book.available
            })
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API para usuários
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        stub = get_user_stub()
        response = stub.GetAllUsers(biblioteca_pb2.Empty())
        users = []
        for user in response.users:
            users.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone
            })
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        stub = get_user_stub()
        response = stub.GetUser(biblioteca_pb2.UserId(id=user_id))
        user = {
            'id': response.id,
            'name': response.name,
            'email': response.email,
            'phone': response.phone
        }
        return jsonify(user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def add_user():
    try:
        data = request.json
        stub = get_user_stub()
        user = biblioteca_pb2.User(
            name=data['name'],
            email=data['email'],
            phone=data['phone']
        )
        response = stub.AddUser(user)
        return jsonify({
            'success': response.success,
            'message': response.message,
            'user': {
                'id': response.user.id,
                'name': response.user.name,
                'email': response.user.email,
                'phone': response.user.phone
            } if response.success else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.json
        stub = get_user_stub()
        user = biblioteca_pb2.User(
            id=user_id,
            name=data['name'],
            email=data['email'],
            phone=data['phone']
        )
        response = stub.UpdateUser(user)
        return jsonify({
            'success': response.success,
            'message': response.message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        stub = get_user_stub()
        response = stub.DeleteUser(biblioteca_pb2.UserId(id=user_id))
        return jsonify({
            'success': response.success,
            'message': response.message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API para empréstimos
@app.route('/api/loans', methods=['GET'])
def get_loans():
    try:
        with grpc.insecure_channel(os.environ.get('SERVER_B_ADDRESS', 'server-b:50052')) as channel:
            stub = biblioteca_pb2_grpc.LoanServiceStub(channel)
            response = stub.GetAllLoans(biblioteca_pb2.Empty())
            return jsonify({
                'loans': [{
                    'id': loan.id,
                    'user_id': loan.user_id,
                    'book_id': loan.book_id,
                    'loan_date': loan.loan_date,
                    'due_date': loan.due_date,
                    'status': loan.status
                } for loan in response.loans]
            })
    except grpc.RpcError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans', methods=['POST'])
def create_loan():
    try:
        data = request.json
        stub = get_loan_stub()
        loan = biblioteca_pb2.Loan(
            user_id=data['user_id'],
            book_id=data['book_id'],
            loan_date=data['loan_date'],
            due_date=data['due_date'],
            status="active"
        )
        response = stub.CreateLoan(loan)
        return jsonify({
            'success': response.success,
            'message': response.message,
            'loan': {
                'id': response.loan.id,
                'user_id': response.loan.user_id,
                'book_id': response.loan.book_id,
                'loan_date': response.loan.loan_date,
                'due_date': response.loan.due_date,
                'return_date': response.loan.return_date,
                'status': response.loan.status
            } if response.success else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/user/<user_id>', methods=['GET'])
def get_user_loans(user_id):
    try:
        stub = get_loan_stub()
        response = stub.GetUserLoans(biblioteca_pb2.UserId(id=user_id))
        loans = []
        for loan in response.loans:
            loans.append({
                'id': loan.id,
                'user_id': loan.user_id,
                'book_id': loan.book_id,
                'loan_date': loan.loan_date,
                'due_date': loan.due_date,
                'return_date': loan.return_date,
                'status': loan.status
            })
        return jsonify(loans)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/<loan_id>/return', methods=['POST'])
def return_book(loan_id):
    try:
        stub = get_loan_stub()
        response = stub.ReturnBook(biblioteca_pb2.LoanId(id=loan_id))
        return jsonify({
            'success': response.success,
            'message': response.message
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/loans/overdue', methods=['GET'])
def get_overdue_loans():
    try:
        stub = get_loan_stub()
        loans = []
        for loan in stub.GetOverdueLoans(biblioteca_pb2.Empty()):
            loans.append({
                'id': loan.id,
                'user_id': loan.user_id,
                'book_id': loan.book_id,
                'loan_date': loan.loan_date,
                'due_date': loan.due_date,
                'return_date': loan.return_date,
                'status': loan.status
            })
        return jsonify(loans)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
