const helpTopics = [
  { title: 'Como funciona o escrow?', description: 'Entenda o pagamento em custódia e quando o valor é liberado.' },
  { title: 'Comprar com segurança', description: 'Dicas para avaliar equipamentos e vendedores.' },
  { title: 'Publicar um anúncio', description: 'Requisitos de fotos, descrição e precificação.' },
  { title: 'Envio e retirada', description: 'Opções de entrega e combinação com o vendedor.' },
  { title: 'Falar com suporte', description: 'Horário de atendimento e canais de contato.' },
];

export function HelpPage() {
  return (
    <div className="t2f-page max-w-3xl">
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Ajuda e suporte</h1>
      <p className="mb-8 text-cinza">Perguntas frequentes e orientações para compradores e vendedores.</p>

      <div className="space-y-3">
        {helpTopics.map((topic) => (
          <button
            key={topic.title}
            type="button"
            className="w-full cursor-pointer rounded-xl border border-nuvem bg-white p-5 text-left transition-colors hover:bg-bruma"
          >
            <div className="mb-1 font-display font-bold text-solo">{topic.title}</div>
            <div className="text-sm text-cinza">{topic.description}</div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-sm text-cinza">
        Conteúdo completo em breve. Para urgências: suporte@trade2fly.com.br (mock).
      </p>
    </div>
  );
}
