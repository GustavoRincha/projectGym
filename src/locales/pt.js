import $vuetify from 'vuetify/es5/locale/pt';

export default {
  $vuetify,

  entities: {
    user: 'Usuário | Usuários',
    visitantes: 'Visitantes | Visitantes',
    recebimento: 'Recebimento MP | Recebimento MP',
    fila: 'Fila | Fila',
    producao: 'Produção | Produções',
    cadastro: 'Cadastro | Cadastro',
    imagens: 'Imagens | Imagens',
    lote: 'Lote | Lote',
    estoque: 'Estoque | Estoque',
    apagar: 'Financeiro Pagar | Financeiro Pagar',
    areceber: 'Financeiro Receber | Financeiro Receber',
  },

  pwa: {
    install: {
      title: `Instalar ${process.env.VUE_APP_PROJECT_NAME}`,
      message: 'Instale nosso aplicativo em sua tela inicial para um acesso mais rápido e fácil.',
      cancell: 'Cancelar',
      install: 'Instalar',
      ios: {
        justTap: 'Basta tocar em',
        then: 'e em',
        homeScreen: 'Tela de Início',
      },
    },

    newAvailable: 'Nova versão disponível',
    update: 'Atualizar',
  },

  messages: {
    download: 'Download em {0}',
    new: '@:labels.new {0}',
    edit: '@:labels.edit {0}',
    active: '{0} está @:labels.active',

    removeTitle: 'Você tem CERTEZA ABSOLUTA disso?',
    removeConfirm: 'Digite o seguinte para confirmar:',
    removeAllertTitle: 'Você está prestes a fazer uma exclusão permanentemente!',
    removeDefaultMessage: 'Essa ação não pode ser desfeita.',

    users: 'Listagem de usuários cadastrados',
    userData: 'Dados do usuário',
    removeUserMessage: '@:messages.removeDefaultMessage Você perderá o usuário e todo o seu conteúdo: empresas, etc.',
    removeUserAllertMessage: 'Depois que um usuário é excluído permanentemente, ele <b>não pode ser recuperado</b>. A exclusão permanente deste usuário <b>excluirá imediatamente todos os recursos relacionados</b>.',

    RecebimentoData: 'Dados do Recebimento',
  },

  labels: {
    consultar: 'Consultar {entidade}',
    email: 'Email',
    password: 'Senha',
    signIn: 'Entrar',
    cpf: 'CPF',
    actions: 'Ações',
    search: 'Pesquisar',
    filters: 'Filtros',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    edit: 'Editar',
    delete: 'Excluir',
    home: 'Principal',
    save: 'Salvar',
    new: 'Adicionar',
    sortBy: 'Classificar por',
    active: 'Ativo',
    before: 'Antes de',
    from: 'De',

    // pagina Recebimento
    contrato: 'Contrato',
    empresa: 'Empresa',
    safra: 'Safra',
    data: 'Data',
    idpessoacontrato: 'IdPessoa',
    pessoacontrato: 'Pessoa',
    propriedade: 'Propriedade',
    dataentrada: 'Data Entrada',
    lote: 'Lote',
    placa: 'Placa',
    pesobruto: 'P.B.',
    ticket: 'Ticket',
    motorista: 'Motorista',
    cr: 'CR',
    produto: 'Produto',
    transportador: 'Transportador',
    pessoaentrega: 'Pessoa Ent',
    umidade: 'Umidade',
    aflatoxina: 'Aflatoxina',
    valorFrete: 'Valor Frete',
    Ate: 'Até',

    // Produção
    idfabrica: 'IdFábrica',
    fabrica: 'Fábrica',
    totalproducao: 'Total Produção',
    idgranulometria: 'IdGranulometria',
    granulometria: 'Granulometria',
    dataproducao: 'Data Produção',
    ordemproducao: 'Ordem Produção',

    // Estoque
    totalestoque: 'Total Estoque',
    idproduto: 'ID Produto',

    fila: {
      IdPortariaCargaDescarga: 'IdPortariaCargaDescarga',
      DescricaoVeiculo: 'Veículo',
      Placa1: 'Placa1',
      Placa2: 'Placa2',
      Placa3: 'Placa3',
      Entrada: 'Data Entrada',
      Saida: 'Data Saída',
      IdMotorista: 'IdMotorista',
      NomeMotorista: 'Motorista',
      IdTransportadora: 'IdTransportadora',
      NomeTransportadora: 'Transportadora',
      IdPropriedade: 'IdPropriedade',
      Propriedade: 'Propriedade',
      DataCadastro: 'Data Cadastro',
    },

    visitantes: {
      dataCadastro: 'Data Cadastro',
      placaVeiculo: 'Placa',
      idVisitante: 'ID Visitante',
      nomeMotorista: 'Motorista',
      idEmpresa: 'ID Empresa',
      nomeEmpresa: 'Empresa',
      contato: 'Contato',
      observacao: 'Observação',
      dataAtendimento: 'Data Atendimento',
      dataLiberacao: 'Data Liberação',
      dataSaida: 'Data Saída',
    },

  },

  erros: {
    login: 'CPF e/ou Senha inválidas',
  },
};
