document.addEventListener('DOMContentLoaded', function() {
    // Navegação entre seções
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const sections = document.querySelectorAll('.section-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Atualizar links ativos
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção correspondente
            const targetSection = this.getAttribute('data-section');
            sections.forEach(section => {
                section.classList.add('d-none');
                if (section.id === `${targetSection}-section`) {
                    section.classList.remove('d-none');
                }
            });
            
            // Carregar dados da seção
            if (targetSection === 'books') {
                loadBooks();
            } else if (targetSection === 'users') {
                loadUsers();
            } else if (targetSection === 'loans') {
                loadLoans();
            }
        });
    });
    
    // Inicialização: carregar livros por padrão
    loadBooks();
    
    // Event listeners para os botões de salvar
    document.getElementById('save-book-btn').addEventListener('click', saveBook);
    document.getElementById('save-user-btn').addEventListener('click', saveUser);
    document.getElementById('save-loan-btn').addEventListener('click', saveLoan);
    
    // Event listener para filtrar livros por categoria
    document.getElementById('filter-books-btn').addEventListener('click', function() {
        const category = document.getElementById('category-filter').value;
        if (category) {
            loadBooksByCategory(category);
        } else {
            loadBooks();
        }
    });
    
    // Event listeners para as abas de empréstimos
    document.querySelectorAll('[data-loan-type]').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Atualizar abas ativas
            document.querySelectorAll('[data-loan-type]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Carregar empréstimos do tipo selecionado
            const loanType = this.getAttribute('data-loan-type');
            loadLoans(loanType);
        });
    });
});

// Funções para carregar dados da API
function loadBooks() {
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            const tableBody = document.getElementById('books-table-body');
            tableBody.innerHTML = '';
            
            books.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td>${book.year}</td>
                    <td>
                        <span class="badge ${book.available ? 'bg-success' : 'bg-danger'}">
                            ${book.available ? 'Disponível' : 'Indisponível'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-action" onclick="editBook('${book.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteBook('${book.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar livros:', error);
            alert('Erro ao carregar livros. Verifique o console para mais detalhes.');
        });
}

function loadBooksByCategory(category) {
    fetch(`/api/books/category/${category}`)
        .then(response => response.json())
        .then(books => {
            const tableBody = document.getElementById('books-table-body');
            tableBody.innerHTML = '';
            
            books.forEach(book => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td>${book.year}</td>
                    <td>
                        <span class="badge ${book.available ? 'bg-success' : 'bg-danger'}">
                            ${book.available ? 'Disponível' : 'Indisponível'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-action" onclick="editBook('${book.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteBook('${book.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar livros por categoria:', error);
            alert('Erro ao carregar livros. Verifique o console para mais detalhes.');
        });
}

function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';
            
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-action" onclick="editUser('${user.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteUser('${user.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info btn-action" onclick="viewUserLoans('${user.id}')">
                            <i class="bi bi-book"></i> Empréstimos
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
            alert('Erro ao carregar usuários. Verifique o console para mais detalhes.');
        });
}

function loadLoans(type = 'all') {
    let url = '/api/loans';
    
    if (type === 'overdue') {
        url = '/api/loans/overdue';
    }
    
    fetch(url)
        .then(response => response.json())
        .then(loans => {
            const tableBody = document.getElementById('loans-table-body');
            tableBody.innerHTML = '';
            
            // Filtrar empréstimos por tipo, se necessário
            let filteredLoans = loans;
            if (type !== 'all' && type !== 'overdue') {
                filteredLoans = loans.filter(loan => loan.status === type);
            }
            
            // Carregar informações de usuários e livros para exibição
            Promise.all([
                fetch('/api/users').then(res => res.json()),
                fetch('/api/books').then(res => res.json())
            ])
            .then(([users, books]) => {
                const userMap = {};
                const bookMap = {};
                
                users.forEach(user => userMap[user.id] = user.name);
                books.forEach(book => bookMap[book.id] = book.title);
                
                filteredLoans.forEach(loan => {
                    const row = document.createElement('tr');
                    const statusClass = loan.status === 'active' ? 'status-active' : 
                                        loan.status === 'returned' ? 'status-returned' : 'status-overdue';
                    
                    row.innerHTML = `
                        <td>${loan.id}</td>
                        <td>${userMap[loan.user_id] || 'Usuário desconhecido'}</td>
                        <td>${bookMap[loan.book_id] || 'Livro desconhecido'}</td>
                        <td>${formatDate(loan.loan_date)}</td>
                        <td>${formatDate(loan.due_date)}</td>
                        <td class="${statusClass}">${getStatusText(loan.status)}</td>
                        <td>
                            ${loan.status === 'active' ? `
                                <button class="btn btn-sm btn-outline-success btn-action" onclick="returnBook('${loan.id}')">
                                    <i class="bi bi-check-circle"></i> Devolver
                                </button>
                            ` : ''}
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar empréstimos:', error);
            alert('Erro ao carregar empréstimos. Verifique o console para mais detalhes.');
        });
}

// Funções para salvar dados
function saveBook() {
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const category = document.getElementById('book-category').value;
    const year = parseInt(document.getElementById('book-year').value);
    
    if (!title || !author || !category || isNaN(year)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const bookData = {
        title,
        author,
        category,
        year
    };
    
    fetch('/api/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Livro adicionado com sucesso!');
            document.getElementById('add-book-form').reset();
            bootstrap.Modal.getInstance(document.getElementById('addBookModal')).hide();
            loadBooks();
        } else {
            alert(`Erro ao adicionar livro: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao adicionar livro:', error);
        alert('Erro ao adicionar livro. Verifique o console para mais detalhes.');
    });
}

function saveUser() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    
    if (!name || !email || !phone) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    const userData = {
        name,
        email,
        phone
    };
    
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuário adicionado com sucesso!');
            document.getElementById('add-user-form').reset();
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            loadUsers();
        } else {
            alert(`Erro ao adicionar usuário: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao adicionar usuário:', error);
        alert('Erro ao adicionar usuário. Verifique o console para mais detalhes.');
    });
}

function saveLoan() {
    const userId = document.getElementById('loan-user').value;
    const bookId = document.getElementById('loan-book').value;
    const loanDate = document.getElementById('loan-date').value;
    const dueDate = document.getElementById('due-date').value;
    
    if (!userId || !bookId || !loanDate || !dueDate) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    const loanData = {
        user_id: userId,
        book_id: bookId,
        loan_date: loanDate,
        due_date: dueDate
    };
    
    fetch('/api/loans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loanData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Empréstimo registrado com sucesso!');
            document.getElementById('add-loan-form').reset();
            bootstrap.Modal.getInstance(document.getElementById('addLoanModal')).hide();
            loadLoans();
        } else {
            alert(`Erro ao registrar empréstimo: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao registrar empréstimo:', error);
        alert('Erro ao registrar empréstimo. Verifique o console para mais detalhes.');
    });
}

// Funções para editar e excluir
function editBook(id) {
    fetch(`/api/books/${id}`)
        .then(response => response.json())
        .then(book => {
            document.getElementById('book-title').value = book.title;
            document.getElementById('book-author').value = book.author;
            document.getElementById('book-category').value = book.category;
            document.getElementById('book-year').value = book.year;
            
            // Modificar o botão salvar para atualizar em vez de criar
            const saveButton = document.getElementById('save-book-btn');
            saveButton.textContent = 'Atualizar';
            saveButton.onclick = function() {
                updateBook(id);
            };
            
            // Abrir o modal
            new bootstrap.Modal(document.getElementById('addBookModal')).show();
        })
        .catch(error => {
            console.error('Erro ao carregar dados do livro:', error);
            alert('Erro ao carregar dados do livro. Verifique o console para mais detalhes.');
        });
}

function updateBook(id) {
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const category = document.getElementById('book-category').value;
    const year = parseInt(document.getElementById('book-year').value);
    
    if (!title || !author || !category || isNaN(year)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const bookData = {
        title,
        author,
        category,
        year
    };
    
    fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Livro atualizado com sucesso!');
            document.getElementById('add-book-form').reset();
            bootstrap.Modal.getInstance(document.getElementById('addBookModal')).hide();
            
            // Restaurar o comportamento original do botão
            const saveButton = document.getElementById('save-book-btn');
            saveButton.textContent = 'Salvar';
            saveButton.onclick = saveBook;
            
            loadBooks();
        } else {
            alert(`Erro ao atualizar livro: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar livro:', error);
        alert('Erro ao atualizar livro. Verifique o console para mais detalhes.');
    });
}

function deleteBook(id) {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
        fetch(`/api/books/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Livro excluído com sucesso!');
                loadBooks();
            } else {
                alert(`Erro ao excluir livro: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erro ao excluir livro:', error);
            alert('Erro ao excluir livro. Verifique o console para mais detalhes.');
        });
    }
}

function editUser(id) {
    fetch(`/api/users/${id}`)
        .then(response => response.json())
        .then(user => {
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-phone').value = user.phone;
            
            // Modificar o botão salvar para atualizar em vez de criar
            const saveButton = document.getElementById('save-user-btn');
            saveButton.textContent = 'Atualizar';
            saveButton.onclick = function() {
                updateUser(id);
            };
            
            // Abrir o modal
            new bootstrap.Modal(document.getElementById('addUserModal')).show();
        })
        .catch(error => {
            console.error('Erro ao carregar dados do usuário:', error);
            alert('Erro ao carregar dados do usuário. Verifique o console para mais detalhes.');
        });
}

function updateUser(id) {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    
    if (!name || !email || !phone) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    const userData = {
        name,
        email,
        phone
    };
    
    fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuário atualizado com sucesso!');
            document.getElementById('add-user-form').reset();
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            
            // Restaurar o comportamento original do botão
            const saveButton = document.getElementById('save-user-btn');
            saveButton.textContent = 'Salvar';
            saveButton.onclick = saveUser;
            
            loadUsers();
        } else {
            alert(`Erro ao atualizar usuário: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao atualizar usuário. Verifique o console para mais detalhes.');
    });
}

function deleteUser(id) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        fetch(`/api/users/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuário excluído com sucesso!');
                loadUsers();
            } else {
                alert(`Erro ao excluir usuário: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário. Verifique o console para mais detalhes.');
        });
    }
}

function returnBook(id) {
    if (confirm('Confirmar devolução do livro?')) {
        fetch(`/api/loans/${id}/return`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Livro devolvido com sucesso!');
                loadLoans();
            } else {
                alert(`Erro ao registrar devolução: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erro ao registrar devolução:', error);
            alert('Erro ao registrar devolução. Verifique o console para mais detalhes.');
        });
    }
}

function viewUserLoans(userId) {
    // Navegar para a seção de empréstimos
    document.querySelector('.nav-link[data-section="loans"]').click();
    
    // Carregar empréstimos do usuário
    fetch(`/api/loans/user/${userId}`)
        .then(response => response.json())
        .then(loans => {
            const tableBody = document.getElementById('loans-table-body');
            tableBody.innerHTML = '';
            
            // Carregar informações de usuários e livros para exibição
            Promise.all([
                fetch('/api/users').then(res => res.json()),
                fetch('/api/books').then(res => res.json())
            ])
            .then(([users, books]) => {
                const userMap = {};
                const bookMap = {};
                
                users.forEach(user => userMap[user.id] = user.name);
                books.forEach(book => bookMap[book.id] = book.title);
                
                loans.forEach(loan => {
                    const row = document.createElement('tr');
                    const statusClass = loan.status === 'active' ? 'status-active' : 
                                        loan.status === 'returned' ? 'status-returned' : 'status-overdue';
                    
                    row.innerHTML = `
                        <td>${loan.id}</td>
                        <td>${userMap[loan.user_id] || 'Usuário desconhecido'}</td>
                        <td>${bookMap[loan.book_id] || 'Livro desconhecido'}</td>
                        <td>${formatDate(loan.loan_date)}</td>
                        <td>${formatDate(loan.due_date)}</td>
                        <td class="${statusClass}">${getStatusText(loan.status)}</td>
                        <td>
                            ${loan.status === 'active' ? `
                                <button class="btn btn-sm btn-outline-success btn-action" onclick="returnBook('${loan.id}')">
                                    <i class="bi bi-check-circle"></i> Devolver
                                </button>
                            ` : ''}
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar empréstimos do usuário:', error);
            alert('Erro ao carregar empréstimos do usuário. Verifique o console para mais detalhes.');
        });
}

// Funções auxiliares
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getStatusText(status) {
    switch (status) {
        case 'active': return 'Ativo';
        case 'returned': return 'Devolvido';
        case 'overdue': return 'Atrasado';
        default: return status;
    }
}

// Carregar usuários e livros disponíveis para o modal de empréstimo
document.getElementById('addLoanModal').addEventListener('show.bs.modal', function() {
    // Carregar usuários
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const userSelect = document.getElementById('loan-user');
            userSelect.innerHTML = '<option value="">Selecione um usuário</option>';
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar usuários:', error);
        });
    
    // Carregar livros disponíveis
    fetch('/api/books')
        .then(response => response.json())
        .then(books => {
            const bookSelect = document.getElementById('loan-book');
            bookSelect.innerHTML = '<option value="">Selecione um livro</option>';
            
            // Filtrar apenas livros disponíveis
            const availableBooks = books.filter(book => book.available);
            
            availableBooks.forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = book.title;
                bookSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar livros:', error);
        });
    
    // Definir data de empréstimo como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('loan-date').value = today;
    
    // Definir data de devolução como 15 dias a partir de hoje
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
});
