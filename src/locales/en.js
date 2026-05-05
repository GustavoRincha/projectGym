import $vuetify from 'vuetify/es5/locale/en';

export default {
  $vuetify,

  entities: {
    user: 'User | Users',
    visitantes: 'Visitantes | Visitantes',
    recebimento: 'Recebimento MP | Recebimentos MP',
    fila: 'Fila | Fila',
    producao: 'Produção | Produções',
    cadastro: 'Cadastro | Cadastro',
    imagens: 'Imagens | Imagens',
    lote: 'Lote | Lote',
    lotes: 'Lotes | Lotes',
    estoque: 'Estoque | Estoque',
    apagar: 'Financeiro Pagar | Financeiro Pagar',
    areceber: 'Financeiro Receber | Financeiro Receber',

  },

  pwa: {
    install: {
      title: `Install ${process.env.VUE_APP_PROJECT_NAME}`,
      message: 'Install our app on your home screen for faster and easier access.',
      cancell: 'Cancel',
      install: 'Install',
      ios: {
        justTap: 'Just tap',
        then: 'then',
        homeScreen: 'Add to Home Screen',
      },
    },

    newAvailable: 'New version available',
    update: 'Update',
  },

  messages: {
    download: 'Download in {0}',
    new: '@:labels.new {0}',
    edit: '@:labels.edit {0}',
    active: '{0} is @:labels.active',

    removeTitle: 'Are you ABSOLUTELY SURE about that?',
    removeConfirm: 'Please type the following to confirm:',
    removeAllertTitle: 'You are about to permanently delete!',
    removeDefaultMessage: 'This action cannot be undone.',

    users: 'List of registered users',
    userData: 'User data',
    removeUserMessage: '@:messages.removeDefaultMessage You will lose the user and all of its content: companies, etc.',
    removeUserAllertMessage: 'Once a user is permanently deleted, he <b>cannot be recovered</b>. Permanently deleting this user <b>will immediately delete all related resources</b>.',

    RecebimentoData: 'Dados do Recebimento',
  },

  labels: {
    pegar: 'Pegar {entidade}',
    consultar: 'Consultar {entidade}',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    cpf: 'CPF',
    actions: 'Actions',
    search: 'Search',
    filters: 'Filters',
    cancel: 'Cancel',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    home: 'Novidades',
    save: 'Save',
    new: 'New',
    sortBy: 'Sort by',
    active: 'Active',
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
    moegranulometria: 'Granulometria',
    moeidgranulometria: 'ID Granulometria',
    moetotalestoque: 'Total Estoque',

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
