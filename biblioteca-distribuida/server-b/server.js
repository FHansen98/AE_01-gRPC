const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Carregar o arquivo proto
const PROTO_PATH = path.join(__dirname, '../proto/biblioteca.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const bibliotecaProto = grpc.loadPackageDefinition(packageDefinition).biblioteca;

// Armazenamento em memória para usuários e empréstimos
const users = new Map();
const loans = new Map();

// Adicionar alguns usuários de exemplo
const sampleUsers = [
  {
    id: uuidv4(),
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(61) 98765-4321'
  },
  {
    id: uuidv4(),
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    phone: '(61) 91234-5678'
  },
  {
    id: uuidv4(),
    name: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    phone: '(61) 99876-5432'
  }
];

sampleUsers.forEach(user => {
  users.set(user.id, user);
});

// Implementação do serviço de usuários
const userService = {
  GetAllUsers: (_, callback) => {
    console.log('[GetAllUsers] Retornando todos os usuários');
    const userList = Array.from(users.values());
    callback(null, { users: userList });
  },

  GetUser: (call, callback) => {
    const userId = call.request.id;
    console.log(`[GetUser] Buscando usuário com ID: ${userId}`);
    
    if (users.has(userId)) {
      callback(null, users.get(userId));
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `Usuário não encontrado com ID: ${userId}`
      });
    }
  },

  AddUser: (call, callback) => {
    const user = call.request;
    console.log(`[AddUser] Adicionando novo usuário: ${user.name}`);
    
    // Gerar um novo ID para o usuário
    user.id = uuidv4();
    users.set(user.id, user);
    
    callback(null, {
      success: true,
      message: 'Usuário adicionado com sucesso',
      user: user
    });
  },

  UpdateUser: (call, callback) => {
    const user = call.request;
    console.log(`[UpdateUser] Atualizando usuário com ID: ${user.id}`);
    
    if (users.has(user.id)) {
      users.set(user.id, user);
      callback(null, {
        success: true,
        message: 'Usuário atualizado com sucesso',
        user: user
      });
    } else {
      callback(null, {
        success: false,
        message: `Usuário não encontrado com ID: ${user.id}`
      });
    }
  },

  DeleteUser: (call, callback) => {
    const userId = call.request.id;
    console.log(`[DeleteUser] Removendo usuário com ID: ${userId}`);
    
    if (users.has(userId)) {
      const user = users.get(userId);
      users.delete(userId);
      callback(null, {
        success: true,
        message: 'Usuário removido com sucesso',
        user: user
      });
    } else {
      callback(null, {
        success: false,
        message: `Usuário não encontrado com ID: ${userId}`
      });
    }
  }
};

// Implementação do serviço de empréstimos
const loanService = {
  CreateLoan: (call, callback) => {
    const loan = call.request;
    console.log(`[CreateLoan] Criando empréstimo para usuário: ${loan.user_id}, livro: ${loan.book_id}`);
    
    // Verificar se o usuário existe
    if (!users.has(loan.user_id)) {
      callback(null, {
        success: false,
        message: `Usuário não encontrado com ID: ${loan.user_id}`
      });
      return;
    }
    
    // Gerar um novo ID para o empréstimo
    loan.id = uuidv4();
    loan.status = 'active';
    loan.return_date = '';
    
    loans.set(loan.id, loan);
    
    callback(null, {
      success: true,
      message: 'Empréstimo criado com sucesso',
      loan: loan
    });
  },

  GetUserLoans: (call, callback) => {
    const userId = call.request.id;
    console.log(`[GetUserLoans] Buscando empréstimos do usuário: ${userId}`);
    
    const userLoans = Array.from(loans.values()).filter(loan => loan.user_id === userId);
    callback(null, { loans: userLoans });
  },

  ReturnBook: (call, callback) => {
    const loanId = call.request.id;
    console.log(`[ReturnBook] Registrando devolução do empréstimo: ${loanId}`);
    
    if (loans.has(loanId)) {
      const loan = loans.get(loanId);
      
      if (loan.status === 'returned') {
        callback(null, {
          success: false,
          message: 'Este livro já foi devolvido'
        });
        return;
      }
      
      loan.status = 'returned';
      loan.return_date = new Date().toISOString().split('T')[0];
      loans.set(loanId, loan);
      
      callback(null, {
        success: true,
        message: 'Devolução registrada com sucesso',
        loan: loan
      });
    } else {
      callback(null, {
        success: false,
        message: `Empréstimo não encontrado com ID: ${loanId}`
      });
    }
  },

  GetOverdueLoans: (call) => {
    console.log('[GetOverdueLoans] Buscando empréstimos atrasados');
    
    const today = new Date().toISOString().split('T')[0];
    const overdueLoans = Array.from(loans.values()).filter(loan => {
      return loan.status === 'active' && loan.due_date < today;
    });
    
    // Atualizar status para 'overdue'
    overdueLoans.forEach(loan => {
      loan.status = 'overdue';
      loans.set(loan.id, loan);
    });
    
    // Enviar empréstimos atrasados em streaming
    overdueLoans.forEach(loan => {
      call.write(loan);
      // Pequeno delay para simular processamento
      setTimeout(() => {}, 100);
    });
    
    call.end();
  },

  UpdateLoanStatus: (call) => {
    console.log('[UpdateLoanStatus] Iniciando streaming bidirecional para atualização de status');
    
    call.on('data', (request) => {
      console.log(`[UpdateLoanStatus] Atualizando status do empréstimo ${request.loan_id} para ${request.new_status}`);
      
      if (loans.has(request.loan_id)) {
        const loan = loans.get(request.loan_id);
        loan.status = request.new_status;
        loans.set(request.loan_id, loan);
        
        call.write({
          success: true,
          message: 'Status atualizado com sucesso',
          loan_id: request.loan_id,
          status: request.new_status
        });
      } else {
        call.write({
          success: false,
          message: `Empréstimo não encontrado com ID: ${request.loan_id}`,
          loan_id: request.loan_id,
          status: 'unknown'
        });
      }
    });
    
    call.on('end', () => {
      console.log('[UpdateLoanStatus] Finalizando streaming bidirecional');
      call.end();
    });
  }
};

// Iniciar o servidor gRPC
function main() {
  const server = new grpc.Server();
  
  server.addService(bibliotecaProto.UserService.service, userService);
  server.addService(bibliotecaProto.LoanService.service, loanService);
  
  const port = 50052;
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Falha ao iniciar o servidor:', err);
      return;
    }
    
    console.log(`Servidor de usuários e empréstimos iniciado na porta ${port}`);
    server.start();
  });
}

main();
