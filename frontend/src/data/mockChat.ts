import type { ChatMessage, ChatThreadMeta } from '../types/chat';
import { listings } from './mockListings';

export const chatThreads: ChatThreadMeta[] = [
  { name: 'Ana Martins', item: 'Velame PD Sabre2 210', price: 'R$ 6.400', time: '10:24', grad: listings[0].grad },
  { name: 'Carlos Souza', item: 'Container UPT Vector 3', price: 'R$ 9.200', time: 'Ontem', grad: listings[1].grad },
  { name: 'Marina Reis', item: 'Reserva PD Optimum 176', price: 'R$ 5.100', time: '2 dias', grad: listings[2].grad },
];

export const initialChatMessages: Record<number, ChatMessage[]> = {
  0: [
    { me: false, text: 'Oi! O Sabre2 ainda está disponível?' },
    { me: true, text: 'Está sim! Pode comprar com pagamento protegido pelo botão do anúncio.' },
    { me: false, text: 'Perfeito. Quantos saltos exatos?' },
    { me: true, text: '380 saltos, sempre guardado em local seco. Linhas trocadas há 50 saltos.' },
  ],
  1: [
    { me: false, text: 'Boa! O Vector serve pra um velame 190?' },
    { me: true, text: 'Serve perfeitamente, é M. Acompanha manual.' },
  ],
  2: [
    { me: true, text: 'Oi Marina, tem interesse em troca pela Optimum?' },
    { me: false, text: 'Posso avaliar! Me manda fotos por aqui.' },
  ],
};
