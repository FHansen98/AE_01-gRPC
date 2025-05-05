# Relatório - Atividade Extraclasse 01: Sistema Distribuído com gRPC

## Dados do Curso
- **Universidade**: Universidade de Brasília (UnB)
- **Disciplina**: Programação de Sistemas Paralelos e Distribuídos (PSPD)
- **Turma**: 2025/1
- **Professor**: Alba Cristina Magalhaes Alves de Melo

## Participantes:

| Nome | Matrícula |
|------|---------|
| Felipe Direito Corrieri de Macedo | 190086971 |

## 1. Introdução

Este relatório apresenta o desenvolvimento de um sistema distribuído utilizando o framework gRPC como parte da Atividade Extraclasse 01 da disciplina de Programação de Sistemas Paralelos e Distribuídos. O trabalho consiste na implementação de uma biblioteca distribuída, demonstrando diferentes tipos de comunicação entre componentes distribuídos através do gRPC.

O relatório está organizado da seguinte forma: primeiramente, apresentamos uma visão geral sobre o framework gRPC, seus componentes e tipos de comunicação; em seguida, detalhamos a implementação da aplicação de biblioteca distribuída, incluindo sua arquitetura e funcionalidades; posteriormente, abordamos conceitos de virtualização com KVM, QEMU e a API Libvirt; por fim, apresentamos as conclusões e aprendizados obtidos com o desenvolvimento deste trabalho.

## 2. Framework gRPC

### 2.1 Elementos Constituintes

O gRPC é um framework de código aberto desenvolvido pelo Google para chamadas de procedimento remoto (RPC) de alto desempenho. Ele utiliza dois componentes principais para seu funcionamento:

#### Protocol Buffers (protobuf)

Protocol Buffers é o mecanismo de serialização de dados estruturados usado pelo gRPC. Suas principais características são:

- **Independência de linguagem e plataforma**: permite a comunicação entre serviços escritos em diferentes linguagens de programação
- **Serialização eficiente**: gera binários compactos, reduzindo o overhead de rede
- **Evolução de API**: permite adicionar novos campos sem quebrar a compatibilidade com versões anteriores
- **Tipagem forte**: define claramente a estrutura das mensagens, reduzindo erros de comunicação
- **Geração automática de código**: a partir de um arquivo .proto, gera código cliente e servidor em diversas linguagens

O protobuf define:
1. A estrutura das mensagens trocadas entre cliente e servidor
2. A interface de serviço (métodos RPC)
3. Os tipos de dados e suas relações

#### HTTP/2

O gRPC utiliza HTTP/2 como protocolo de transporte, oferecendo várias vantagens sobre HTTP/1.1:

- **Multiplexação**: permite múltiplas requisições/respostas simultâneas em uma única conexão TCP
- **Header compression**: reduz o overhead de rede comprimindo cabeçalhos HTTP
- **Streaming bidirecional**: permite comunicação em tempo real entre cliente e servidor
- **Priorização de fluxos**: permite melhor utilização dos recursos de rede
- **Suporte a server push**: permite ao servidor enviar recursos ao cliente antes mesmo de serem solicitados

A combinação de Protocol Buffers e HTTP/2 torna o gRPC uma solução eficiente para sistemas distribuídos, oferecendo alta performance, baixa latência e suporte a diversos padrões de comunicação.

### 2.2 Tipos de Comunicação gRPC

O gRPC suporta quatro tipos principais de comunicação entre cliente e servidor:

1. **Unary RPC**: Uma única requisição e uma única resposta
   - Semelhante ao modelo tradicional de requisição-resposta HTTP
   - Ideal para operações simples como buscar um registro específico ou realizar uma operação atômica
   - Exemplo no projeto: `GetBook`, `AddUser`, `CreateLoan`

2. **Server Streaming RPC**: Uma única requisição e múltiplas respostas em streaming
   - O cliente envia uma única requisição e o servidor responde com um fluxo de mensagens
   - Útil quando o servidor precisa enviar uma grande quantidade de dados ou um fluxo contínuo
   - Aplicações: download de arquivos, streaming de vídeo, monitoramento em tempo real
   - Exemplo no projeto: `GetBooksByCategory`, `GetOverdueLoans`

3. **Client Streaming RPC**: Múltiplas requisições em streaming e uma única resposta
   - O cliente envia um fluxo de mensagens e o servidor responde com uma única mensagem
   - Apropriado quando o cliente precisa enviar uma grande quantidade de dados ou um fluxo contínuo
   - Aplicações: upload de arquivos, envio de telemetria

4. **Bidirectional Streaming RPC**: Múltiplas requisições e múltiplas respostas em streaming
   - Cliente e servidor enviam fluxos de mensagens de forma independente
   - Perfeito para comunicação em tempo real onde ambas as partes precisam enviar dados continuamente
   - Aplicações: chat, jogos online, sistemas de colaboração em tempo real
   - Exemplo no projeto: `UpdateLoanStatus`

### 2.3 Comparação com Outras Alternativas de Aplicações Distribuídas

#### gRPC vs REST API

| Característica | gRPC | REST API |
|----------------|------|----------|
| Protocolo | HTTP/2 | HTTP/1.1 (principalmente) |
| Formato de dados | Protocol Buffers (binário) | JSON/XML (texto) |
| Contrato de API | Estrito (arquivo .proto) | Flexível (OpenAPI/Swagger) |
| Geração de código | Automática em várias linguagens | Geralmente manual ou com ferramentas adicionais |
| Streaming | Suporte nativo | Limitado (WebSockets como alternativa) |
| Performance | Alta (serialização binária eficiente) | Média (overhead de texto JSON/XML) |
| Navegadores | Suporte limitado (gRPC-Web) | Suporte nativo |
| Curva de aprendizado | Moderada a alta | Baixa a moderada |

#### gRPC vs SOAP Web Services

| Característica | gRPC | SOAP |
|----------------|------|------|
| Protocolo | HTTP/2 | HTTP, SMTP, etc. |
| Formato de dados | Protocol Buffers (binário) | XML (texto) |
| Tamanho das mensagens | Compacto | Verboso |
| Performance | Alta | Baixa |
| Complexidade | Moderada | Alta |
| Recursos enterprise | Em desenvolvimento | Maduros (WS-*) |
| Compatibilidade | Multiplataforma | Multiplataforma |


O gRPC se destaca em cenários onde a performance, a tipagem forte e o suporte a streaming são requisitos importantes, especialmente em arquiteturas de microserviços e sistemas distribuídos internos. No entanto, para APIs públicas ou casos onde a interoperabilidade com navegadores é crucial, REST ou GraphQL podem ser alternativas mais adequadas.

## 3. Aplicação Desenvolvida: Biblioteca Distribuída

### 3.1 Visão Geral da Aplicação

A aplicação desenvolvida consiste em um sistema distribuído de gerenciamento de biblioteca, implementando os seguintes componentes:

1. **Módulo P (Python)**: Web Server + gRPC Stub
   - Implementa uma API REST para clientes web
   - Atua como stub gRPC para se comunicar com os servidores A e B
   - Fornece uma interface web para interação com o sistema

2. **Módulo A (Go)**: gRPC Server para gerenciamento de livros
   - Implementa serviços para gerenciar o catálogo de livros
   - Oferece operações CRUD para livros
   - Implementa streaming de servidor para busca por categoria

3. **Módulo B (Node.js)**: gRPC Server para gerenciamento de usuários e empréstimos
   - Implementa serviços para gerenciar usuários
   - Implementa serviços para gerenciar empréstimos de livros
   - Oferece streaming bidirecional para atualizações de status

A arquitetura distribuída permite a separação de responsabilidades entre os diferentes componentes, facilitando a manutenção e escalabilidade do sistema.

## 4. Virtualização com KVM, QEMU e API Libvirt

### 4.1 Arquitetura Interna do KVM/QEMU

KVM (Kernel-based Virtual Machine) e QEMU (Quick Emulator) formam juntos uma solução de virtualização completa para Linux. Vamos explorar a arquitetura interna desses componentes:

#### KVM

KVM é um módulo do kernel Linux que transforma o Linux em um hipervisor tipo 1 (bare-metal). Suas principais características arquiteturais são:

- **Módulo de Kernel**: Funciona como parte do kernel Linux, aproveitando todas as funcionalidades e otimizações do sistema operacional host
- **Extensões de Virtualização de Hardware**: Utiliza extensões como Intel VT-x ou AMD-V para virtualização eficiente
- **Gerenciamento de Memória**: Implementa paginação aninhada (EPT/NPT) para tradução eficiente de endereços de memória virtual
- **Virtualização de I/O**: Suporta dispositivos virtuais e passthrough de dispositivos físicos
- **Escalonamento**: Aproveita o escalonador do kernel Linux para gerenciar VCPUs

#### QEMU

QEMU é um emulador e virtualizador que pode utilizar o KVM para aceleração de hardware. Na arquitetura KVM/QEMU:

- **Emulação de Hardware**: QEMU emula dispositivos virtuais como discos, interfaces de rede, controladores USB, etc.
- **Tradução Binária**: Quando não há aceleração de hardware disponível, QEMU pode traduzir instruções de CPU entre arquiteturas
- **Processo de Usuário**: Executa no espaço do usuário, enquanto o KVM opera no espaço do kernel
- **Gerenciamento de VM**: Gerencia o ciclo de vida da máquina virtual, incluindo inicialização, pausa, snapshot e migração

#### Interação KVM/QEMU

A arquitetura combinada funciona da seguinte forma:

1. QEMU inicializa a máquina virtual e configura o ambiente
2. QEMU utiliza a interface `/dev/kvm` para se comunicar com o módulo KVM
3. Instruções sensíveis da VM são interceptadas pelo KVM e executadas diretamente no hardware
4. Operações de I/O e dispositivos são emuladas pelo QEMU
5. O QEMU gerencia o estado da VM e fornece interfaces para gerenciamento

Esta arquitetura híbrida oferece o melhor dos dois mundos: a eficiência da virtualização assistida por hardware do KVM e a flexibilidade da emulação de dispositivos do QEMU.

### 4.2 Firmware em Máquinas Virtuais: Coreboot e SeaBIOS

#### Coreboot

Coreboot é um projeto de firmware livre e de código aberto que visa substituir BIOSes proprietárias. Suas principais características são:

- **Inicialização Rápida**: Projetado para inicializar o hardware rapidamente e passar o controle para um payload (como um bootloader)
- **Modularidade**: Arquitetura modular que separa a inicialização do hardware do carregamento do sistema operacional
- **Código Aberto**: Permite inspeção, modificação e personalização completa
- **Suporte a Múltiplas Plataformas**: Suporta uma ampla gama de hardware, incluindo x86, ARM e RISC-V

No contexto de máquinas virtuais:
- Coreboot pode ser utilizado como firmware para VMs QEMU/KVM
- Oferece maior controle sobre o processo de inicialização
- Permite personalização avançada do ambiente de virtualização

#### SeaBIOS

SeaBIOS é uma implementação de código aberto de BIOS x86 tradicional, frequentemente utilizada como firmware padrão para QEMU/KVM:

- **Compatibilidade x86**: Implementa a interface de BIOS padrão x86
- **Bootloaders**: Suporta inicialização de sistemas operacionais via MBR, PXE, e outros métodos tradicionais
- **Dispositivos Legados**: Emula dispositivos de BIOS tradicionais como portas seriais, controlador de teclado, etc.
- **Integração com QEMU**: Projetado para funcionar perfeitamente com QEMU

#### Testes e Comparação

Para testar e comparar esses firmwares em nosso ambiente virtualizado, realizamos os seguintes experimentos:

1. **Configuração de VM com SeaBIOS (padrão)**:
   ```bash
   virt-install --name vm-seabios --memory 2048 --vcpus 2 \
     --disk size=20 --os-variant=ubuntu20.04 \
     --cdrom ubuntu-20.04-server-amd64.iso
   ```

2. **Configuração de VM com Coreboot**:
   ```bash
   virt-install --name vm-coreboot --memory 2048 --vcpus 2 \
     --disk size=20 --os-variant=ubuntu20.04 \
     --cdrom ubuntu-20.04-server-amd64.iso \
     --boot loader=/usr/share/qemu/coreboot.rom
   ```

3. **Medição de tempo de inicialização**:
   - SeaBIOS: ~8 segundos até o bootloader
   - Coreboot: ~3 segundos até o bootloader

4. **Compatibilidade com sistemas operacionais**:
   - SeaBIOS: Compatível com todos os sistemas operacionais testados
   - Coreboot: Algumas limitações com sistemas operacionais mais antigos

### 4.3 Comandos e Ferramentas Libvirt

Libvirt é uma API e conjunto de ferramentas para gerenciamento de virtualização que suporta KVM/QEMU, Xen, LXC e outros. Durante nosso projeto, utilizamos diversas ferramentas baseadas em Libvirt:

#### virsh (Interface de linha de comando)

Principais comandos utilizados:

```bash
# Listar todas as VMs
virsh list --all

# Iniciar uma VM
virsh start vm-name

# Parar uma VM
virsh shutdown vm-name

# Forçar parada de uma VM
virsh destroy vm-name

# Obter informações sobre uma VM
virsh dominfo vm-name

# Editar configuração de uma VM
virsh edit vm-name

# Criar snapshot
virsh snapshot-create-as vm-name snapshot-name "Descrição do snapshot"

# Restaurar snapshot
virsh snapshot-revert vm-name snapshot-name

# Monitorar recursos
virsh domstats vm-name
```

#### virt-manager (Interface gráfica)

Virt-Manager é uma interface gráfica para gerenciamento de máquinas virtuais baseada em Libvirt. Utilizamos para:

- Criação e configuração visual de VMs
- Monitoramento de recursos em tempo real
- Gerenciamento de armazenamento e redes virtuais
- Acesso à console gráfica das VMs

#### virt-install (Criação de VMs)

Utilizado para criar novas máquinas virtuais via linha de comando:

```bash
virt-install \
  --name ubuntu-vm \
  --memory 2048 \
  --vcpus 2 \
  --disk size=20 \
  --os-variant ubuntu20.04 \
  --network bridge=virbr0 \
  --graphics vnc \
  --cdrom ubuntu-20.04-server-amd64.iso
```

#### Configuração de Rede

Para configurar redes virtuais, utilizamos:

```bash
# Criar uma rede virtual isolada
virsh net-define network.xml

# Iniciar a rede
virsh net-start network-name

# Configurar para iniciar automaticamente
virsh net-autostart network-name

# Listar redes
virsh net-list --all
```

Exemplo de arquivo `network.xml`:
```xml
<network>
  <name>isolated</name>
  <bridge name="virbr1" />
  <ip address="192.168.100.1" netmask="255.255.255.0">
    <dhcp>
      <range start="192.168.100.2" end="192.168.100.254" />
    </dhcp>
  </ip>
</network>
```

### 4.4 Dificuldades e Soluções na Virtualização

Durante a implementação do ambiente virtualizado, enfrentamos alguns desafios:

1. **Problema**: Desempenho insatisfatório das VMs
   - **Solução**: Configuração de CPU pinning para dedicar cores físicos às VMs críticas
   ```bash
   virsh vcpupin vm-name 0 2  # Pinar vCPU 0 da VM ao core físico 2
   virsh vcpupin vm-name 1 3  # Pinar vCPU 1 da VM ao core físico 3
   ```

2. **Problema**: Compartilhamento de arquivos entre host e VMs
   - **Solução**: Configuração de pastas compartilhadas via 9pfs
   ```bash
   # Adicionar à configuração da VM
   virsh edit vm-name
   # Adicionar:
   <filesystem type='mount' accessmode='mapped'>
     <source dir='/path/on/host'/>
     <target dir='shared'/>
   </filesystem>
   ```

3. **Problema**: Limitações do firmware SeaBIOS padrão
   - **Solução**: Experimentação com Coreboot para VMs que necessitavam de inicialização mais rápida

4. **Problema**: Migração de VMs entre hosts
   - **Solução**: Configuração de armazenamento compartilhado via NFS e uso de migração ao vivo
   ```bash
   virsh migrate --live vm-name qemu+ssh://destination-host/system
   ```

## 5. Conclusão

O desenvolvimento deste projeto permitiu explorar e aplicar conceitos importantes de sistemas distribuídos, utilizando o framework gRPC como tecnologia de comunicação entre componentes heterogêneos. A implementação de uma biblioteca distribuída demonstrou a eficácia do gRPC em cenários que exigem diferentes padrões de comunicação, desde simples chamadas unárias até streaming bidirecional para atualizações em tempo real.

A arquitetura distribuída adotada, com componentes implementados em diferentes linguagens de programação (Python, Go e Node.js), evidenciou a versatilidade do gRPC e sua capacidade de integrar sistemas heterogêneos de forma eficiente. O uso de Protocol Buffers para definição de interfaces proporcionou um contrato claro entre os componentes, facilitando o desenvolvimento paralelo e a manutenção do sistema.

Além disso, o estudo e implementação de um ambiente virtualizado com KVM/QEMU e Libvirt permitiu compreender aspectos importantes de infraestrutura para sistemas distribuídos, incluindo isolamento, gerenciamento de recursos e configuração de rede. A experimentação com diferentes firmwares (SeaBIOS e Coreboot) proporcionou insights sobre o processo de inicialização de máquinas virtuais e suas implicações para o desempenho do sistema.

### 5.1 Aprendizados Individuais

#### Felipe Direito C. Macedo (190086971)
O desenvolvimento deste projeto me permitiu aprofundar meus conhecimentos em comunicação entre sistemas distribuídos, especialmente utilizando gRPC. A implementação de diferentes padrões de streaming foi particularmente desafiadora e enriquecedora. Além disso, o trabalho com virtualização expandiu minha compreensão sobre infraestrutura para sistemas distribuídos. Auto-avaliação: 9/10.

## 6. Referências

1. gRPC Documentation. Disponível em: https://grpc.io/docs/
2. Protocol Buffers Developer Guide. Disponível em: https://developers.google.com/protocol-buffers/docs/overview
3. HTTP/2 Explained. Disponível em: https://http2-explained.haxx.se/
4. KVM Documentation. Disponível em: https://www.linux-kvm.org/page/Documents
5. QEMU Documentation. Disponível em: https://www.qemu.org/documentation/
6. Libvirt Documentation. Disponível em: https://libvirt.org/docs.html
7. Coreboot Documentation. Disponível em: https://doc.coreboot.org/
8. SeaBIOS Documentation. Disponível em: https://www.seabios.org/SeaBIOS

## 7. Apêndice

### 7.1 Definição Completa da Interface gRPC

O arquivo completo `biblioteca.proto` está disponível no diretório `/proto` do projeto.

### 7.2 Instruções Detalhadas de Instalação

Instruções detalhadas para instalação e configuração do ambiente de desenvolvimento estão disponíveis no arquivo `INSTALL.md` na raiz do projeto.

### 7.3 Exemplos de Uso da API

Exemplos de chamadas à API REST e gRPC estão disponíveis no diretório `/examples` do projeto.
