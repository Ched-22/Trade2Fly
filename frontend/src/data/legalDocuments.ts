export type LegalDocumentSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  id: string;
  title: string;
  summary: string;
  version: string;
  updatedAt: string;
  sections: LegalDocumentSection[];
};

export const LEGAL_DOCUMENT_VERSION = '2026-07-10';

export const legalDocuments: Record<string, LegalDocument> = {
  termos: {
    id: 'termos',
    title: 'Termos de Uso',
    summary: 'Regras gerais de uso da plataforma Trade2Fly.',
    version: LEGAL_DOCUMENT_VERSION,
    updatedAt: '10 de julho de 2026',
    sections: [
      {
        title: 'Documento em elaboração',
        paragraphs: [
          'Os Termos de Uso completos da Trade2Fly estão sendo finalizados por nossa equipe jurídica.',
          'Ao utilizar a plataforma, você concorda em seguir as regras de conduta, usar o marketplace de forma lícita e respeitar outros usuários.',
          'Esta versão provisória será substituída pelo documento definitivo. Recomendamos revisar esta página periodicamente.',
        ],
      },
      {
        title: 'Uso da plataforma',
        paragraphs: [
          'A Trade2Fly é um marketplace para compra e venda de equipamentos de paraquedismo, com recursos de negociação e pagamento protegido.',
          'É proibido burlar o sistema de pagamento, publicar informações falsas ou utilizar a plataforma para atividades ilegais.',
        ],
      },
    ],
  },
  privacidade: {
    id: 'privacidade',
    title: 'Política de Privacidade',
    summary: 'Como tratamos seus dados pessoais.',
    version: LEGAL_DOCUMENT_VERSION,
    updatedAt: '10 de julho de 2026',
    sections: [
      {
        title: 'Documento em elaboração',
        paragraphs: [
          'A Política de Privacidade completa está em elaboração e será publicada em breve.',
          'Coletamos dados necessários para cadastro, transações, comunicação entre usuários e cumprimento de obrigações legais.',
          'Não vendemos seus dados pessoais. Você poderá exercer seus direitos conforme a LGPD quando o documento definitivo estiver disponível.',
        ],
      },
    ],
  },
  vendedor: {
    id: 'vendedor',
    title: 'Termos do Vendedor',
    summary: 'Obrigações, taxas e regras para quem anuncia e vende na Trade2Fly.',
    version: LEGAL_DOCUMENT_VERSION,
    updatedAt: '10 de julho de 2026',
    sections: [
      {
        title: 'Documento em elaboração',
        paragraphs: [
          'Os Termos do Vendedor completos estão sendo finalizados. O conteúdo abaixo resume as regras principais já em vigor na plataforma.',
        ],
      },
      {
        title: 'Comissão',
        paragraphs: [
          'A Trade2Fly cobra comissão de 5% sobre o valor da venda, deduzida na liberação do pagamento ao vendedor.',
          'A primeira venda concluída de cada vendedor é isenta dessa comissão. Frete, seguro frete e taxas de processamento de pagamento não entram na isenção.',
          'O valor exibido no anúncio é o preço bruto negociado com o comprador; o líquido recebido será o valor da venda menos a comissão aplicável.',
        ],
      },
      {
        title: 'Pagamento protegido e envio',
        paragraphs: [
          'Vendas com custódia devem ser concluídas exclusivamente pela plataforma. Não solicite ou aceite pagamento fora do fluxo oficial.',
          'O vendedor é responsável por descrever o equipamento com veracidade, enviar no prazo acordado e fornecer provas de despacho quando solicitado.',
        ],
      },
      {
        title: 'Conduta e sanções',
        paragraphs: [
          'Informar valores divergentes do negociado no chat, omitir defeitos relevantes ou violar as regras da plataforma pode resultar em suspensão ou banimento.',
        ],
      },
    ],
  },
};

export const legalDocumentList = Object.values(legalDocuments);

export function getLegalDocument(id: string): LegalDocument | undefined {
  return legalDocuments[id];
}

export function legalDocumentPath(id: string): string {
  return `/legal/${id}`;
}
