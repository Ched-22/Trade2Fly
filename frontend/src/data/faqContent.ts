export const SUPPORT_EMAIL = 'suporte@trade2fly.com.br';
export const PLATFORM_FEE_PERCENT = 5;

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const faqSections: FaqSection[] = [
  {
    id: 'escrow',
    title: 'Pagamento em custódia (Escrow)',
    items: [
      {
        id: 'escrow-what',
        question: 'O que é pagamento em custódia (escrow)?',
        answer:
          'Na Trade2Fly, o valor pago pelo comprador fica retido em custódia até que o equipamento seja recebido e aprovado. Isso protege o comprador contra fraudes e o vendedor contra calote — o dinheiro só muda de mãos quando a transação é concluída com segurança.',
      },
      {
        id: 'escrow-how',
        question: 'Como funciona o pagamento escrow passo a passo?',
        answer:
          '1) O comprador paga pelo anúncio no checkout.\n2) O valor fica retido na custódia da Trade2Fly (não vai direto ao vendedor).\n3) O vendedor envia o equipamento conforme combinado.\n4) O comprador inspeciona o item ao receber.\n5) O comprador confirma que está tudo certo → o valor é liberado ao vendedor, descontada a taxa de serviço.',
      },
      {
        id: 'escrow-when-release',
        question: 'Quando o vendedor recebe o dinheiro?',
        answer:
          'Após o comprador confirmar que recebeu o equipamento conforme o anúncio. Até essa confirmação, o valor permanece retido na custódia da Trade2Fly.',
      },
      {
        id: 'escrow-fees',
        question: 'Quais taxas são cobradas no escrow?',
        answer: `A Trade2Fly cobra uma taxa de serviço de ${PLATFORM_FEE_PERCENT}% sobre o valor da transação, deduzida na liberação ao vendedor. Taxas de processamento do meio de pagamento (cartão, PIX etc.) podem se aplicar conforme o método escolhido no checkout.`,
      },
      {
        id: 'escrow-dispute',
        question: 'E se o equipamento não for como descrito?',
        answer: `Antes de confirmar o recebimento, o comprador pode entrar em contato com o suporte (${SUPPORT_EMAIL}) para relatar divergências. O valor permanece retido na custódia até a análise da equipe Trade2Fly. Não confirme o recebimento se o item não estiver como anunciado.`,
      },
      {
        id: 'escrow-mandatory',
        question: 'Todo anúncio usa escrow?',
        answer:
          'Sim. Na Trade2Fly, os anúncios publicados utilizam pagamento em custódia para proteger compradores e vendedores em todas as transações.',
      },
      {
        id: 'escrow-cancel',
        question: 'Posso cancelar após pagar?',
        answer: `Se o vendedor ainda não despachou o equipamento, entre em contato com o suporte (${SUPPORT_EMAIL}) o quanto antes. Após o envio, o cancelamento segue as regras da plataforma e pode depender da análise do caso.`,
      },
    ],
  },
  {
    id: 'account',
    title: 'Conta e cadastro',
    items: [
      {
        id: 'account-create',
        question: 'Como criar uma conta?',
        answer:
          'Clique em "Entrar" no topo do site e depois em "Criar conta". Preencha nome, e-mail e senha. Após o cadastro, sua conta pode precisar de ativação manual pela equipe Trade2Fly antes do primeiro acesso.',
      },
      {
        id: 'account-activate',
        question: 'Por que minha conta precisa ser ativada?',
        answer:
          'A ativação manual ajuda a manter a comunidade segura e reduz contas fraudulentas no marketplace de equipamentos de paraquedismo. Você receberá acesso assim que a equipe confirmar seu cadastro.',
      },
      {
        id: 'account-login',
        question: 'Esqueci minha senha — o que fazer?',
        answer:
          'Na tela de login, clique em "Esqueci minha senha", informe seu e-mail e siga o link enviado para redefinir a senha.',
      },
      {
        id: 'account-profile',
        question: 'Como editar meu perfil e foto?',
        answer:
          'Com a conta logada, acesse "Perfil" no menu do usuário. Lá você pode atualizar nome de exibição, dados de contato, foto e informações de recebimento.',
      },
    ],
  },
  {
    id: 'buy',
    title: 'Comprar',
    items: [
      {
        id: 'buy-how',
        question: 'Como comprar um equipamento?',
        answer:
          'Encontre o anúncio na home ou em Busca, abra a página do item e clique em "Comprar". No checkout, escolha a forma de pagamento e conclua a compra. O valor ficará em custódia até você confirmar o recebimento.',
      },
      {
        id: 'buy-offer',
        question: 'Posso enviar uma oferta abaixo do preço?',
        answer:
          'Sim. Na página do anúncio, use "Enviar oferta" para propor um valor e uma mensagem ao vendedor. A negociação continua pelo chat da plataforma.',
      },
      {
        id: 'buy-inspect',
        question: 'O que verificar antes de confirmar o recebimento?',
        answer:
          'Confira se o equipamento corresponde às fotos e à descrição: marca, modelo, tamanho, estado (Novo/Bom/Usado), número de saltos, data de repack (reservas) e sinais de desgaste. Se possível, leve a um rigger de confiança antes de usar em salto.',
      },
      {
        id: 'buy-favorites',
        question: 'Como salvar anúncios nos favoritos?',
        answer:
          'Clique no ícone de coração no card do anúncio ou na página do item. Seus favoritos ficam salvos na conta e podem ser acessados em "Favoritos" no menu.',
      },
    ],
  },
  {
    id: 'sell',
    title: 'Vender',
    items: [
      {
        id: 'sell-how',
        question: 'Como publicar um anúncio?',
        answer:
          'Com a conta ativa, acesse "Vender" no menu. Preencha fotos, título, marca, categoria, detalhes do equipamento, estado, preço, localização e descrição. A pré-visualização mostra como o anúncio aparecerá para compradores.',
      },
      {
        id: 'sell-photos',
        question: 'Quantas fotos posso enviar e quais formatos?',
        answer:
          'Mínimo de 1 e máximo de 8 fotos por anúncio. Formatos aceitos: JPG, PNG e WebP, até 2 MB cada. A primeira foto é a capa do anúncio.',
      },
      {
        id: 'sell-condition',
        question: 'O que significa Novo, Bom e Usado?',
        answer:
          'Novo: equipamento sem uso ou lacrado, como saiu da fábrica/loja.\nBom: usado com desgaste leve a moderado, em condição de uso seguro.\nUsado: sinais claros de uso; descreva honestamente o estado na descrição e nas fotos.',
      },
      {
        id: 'sell-price',
        question: 'Como definir o preço do equipamento?',
        answer:
          'Pesquise anúncios similares na plataforma e use a calculadora de valor em Ferramentas. Considere estado, histórico de manutenção e demanda da categoria.',
      },
      {
        id: 'sell-edit',
        question: 'Posso editar ou remover um anúncio depois?',
        answer:
          'Seus anúncios ativos aparecem em "Meus anúncios". A edição completa de anúncios publicados pode estar em evolução; para alterações urgentes, entre em contato com o suporte.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Envio e entrega',
    items: [
      {
        id: 'ship-who',
        question: 'Quem paga o frete?',
        answer:
          'O frete é pago pelo comprador. No checkout, informe o CEP de destino para ver o valor estimado com base na origem do anúncio (cidade/estado do vendedor), no peso do equipamento e na distância. Retirada em mão pode ser escolhida sem custo de frete.',
      },
      {
        id: 'ship-tracking',
        question: 'Como funciona o rastreamento?',
        answer:
          'O vendedor deve informar código de rastreio ou comprovante de envio pelo chat assim que despachar o equipamento. Guarde as mensagens e comprovantes até confirmar o recebimento.',
      },
      {
        id: 'ship-pickup',
        question: 'Posso combinar retirada em mão?',
        answer:
          'Sim, desde que comprador e vendedor concordem. Combine local, data e forma de inspeção pelo chat antes de confirmar o recebimento na plataforma.',
      },
    ],
  },
  {
    id: 'fees',
    title: 'Taxas e pagamentos',
    items: [
      {
        id: 'fees-platform',
        question: 'Quais taxas a Trade2Fly cobra?',
        answer: `Taxa de serviço de ${PLATFORM_FEE_PERCENT}% sobre o valor da venda em transações com custódia (escrow).`,
      },
      {
        id: 'fees-payout',
        question: 'Como recebo como vendedor?',
        answer: `Após o comprador confirmar o recebimento, o valor líquido (preço menos ${PLATFORM_FEE_PERCENT}%) é liberado conforme os dados de recebimento cadastrados no seu perfil.`,
      },
      {
        id: 'fees-methods',
        question: 'Quais formas de pagamento o comprador pode usar?',
        answer:
          'No checkout estão disponíveis cartão de crédito e PIX, conforme as opções exibidas na tela de pagamento.',
      },
    ],
  },
  {
    id: 'trust',
    title: 'Segurança e confiança',
    items: [
      {
        id: 'trust-scam',
        question: 'Como evitar golpes?',
        answer:
          'Negocie e pague somente pela Trade2Fly. Não aceite pagamento fora da plataforma. Desconfie de preços muito abaixo do mercado. Use a custódia e só confirme o recebimento após inspecionar o equipamento.',
      },
      {
        id: 'trust-data',
        question: 'Meus dados estão seguros?',
        answer:
          'Seus dados de cadastro e pagamento são tratados com boas práticas de segurança. Não compartilhe senha nem links de pagamento fora do site oficial.',
      },
      {
        id: 'trust-rigger',
        question: 'Devo levar o equipamento a um rigger antes de usar?',
        answer:
          'Sim, é altamente recomendado — especialmente para velames, reservas e containers. Um rigger certificado pode verificar estado, linhas, pilot chute e documentação antes do primeiro salto com o equipamento comprado.',
      },
    ],
  },
  {
    id: 'tools',
    title: 'Ferramentas e recursos',
    items: [
      {
        id: 'tools-what',
        question: 'O que são as ferramentas para skydivers?',
        answer:
          'São calculadoras e guias gratuitos no menu Ferramentas: wingloading, guia de harness, guia de container e calculadora de valor de equipamento.',
      },
      {
        id: 'tools-wingloading',
        question: 'Para que serve a calculadora de wingloading?',
        answer:
          'Ela estima a carga alar (wingloading) com base no peso do skydiver e na área do velame, ajudando a avaliar se um tamanho de paraquedas é adequado ao seu perfil.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Suporte',
    items: [
      {
        id: 'support-contact',
        question: 'Como falar com o suporte?',
        answer: `Envie um e-mail para ${SUPPORT_EMAIL} com o máximo de detalhes (número do anúncio, prints, descrição do problema).`,
      },
      {
        id: 'support-hours',
        question: 'Qual o horário de atendimento?',
        answer:
          'Atendimento por e-mail em dias úteis, das 9h às 18h (horário de Brasília). Resposta em até 2 dias úteis.',
      },
    ],
  },
];
