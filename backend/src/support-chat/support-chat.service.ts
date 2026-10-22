import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { OrdersService } from '../orders/orders.service';
import { SUPPORT_EMAIL, SUPPORT_SYSTEM_PROMPT } from './support-knowledge';
import type { SendSupportMessageDto } from './dto/send-support-message.dto';

export type SupportChatResult = {
  reply: string;
  escalate: { reason: string; email: string } | null;
};

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_my_orders',
      description:
        'Lista os pedidos (compras) do usuário autenticado, com status e informações do anúncio. Use quando o usuário perguntar sobre "meus pedidos" ou pedidos em geral.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_order_details',
      description: 'Busca detalhes de um pedido específico do usuário autenticado pelo ID do pedido.',
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'integer', description: 'ID numérico do pedido' },
        },
        required: ['orderId'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description:
        'Encaminha a conversa para o suporte humano. Use para problemas reais (item não recebido, divergência, fraude, disputa) ou quando o usuário pedir para falar com uma pessoa.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Resumo curto do motivo do encaminhamento' },
        },
        required: ['reason'],
        additionalProperties: false,
      },
    },
  },
];

const MAX_TOOL_ROUNDS = 4;

@Injectable()
export class SupportChatService {
  private readonly logger = new Logger(SupportChatService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    this.model = this.config.get<string>('GROQ_MODEL') ?? 'openai/gpt-oss-120b';
    this.client = apiKey
      ? new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })
      : null;
  }

  async sendMessage(userId: string | null, dto: SendSupportMessageDto): Promise<SupportChatResult> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Chat de suporte indisponível no momento. Envie um e-mail para ' + SUPPORT_EMAIL,
      );
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SUPPORT_SYSTEM_PROMPT },
      ...(dto.history ?? []).map(
        (turn): ChatCompletionMessageParam => ({ role: turn.role, content: turn.content }),
      ),
      { role: 'user', content: dto.message },
    ];

    let escalate: { reason: string; email: string } | null = null;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: TOOLS,
        temperature: 0.3,
        max_tokens: 800,
      });

      const choice = completion.choices[0];
      const responseMessage = choice.message;
      const toolCalls = responseMessage.tool_calls ?? [];

      if (toolCalls.length === 0) {
        return { reply: responseMessage.content?.trim() || 'Desculpe, não consegui gerar uma resposta.', escalate };
      }

      messages.push(responseMessage);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== 'function') continue;
        const result = await this.runTool(userId, toolCall.function.name, toolCall.function.arguments);
        if (result.escalate) escalate = result.escalate;
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result.output),
        });
      }
    }

    return {
      reply:
        'Não consegui concluir sua solicitação automaticamente. Vou encaminhar para o time de suporte.',
      escalate: escalate ?? { reason: 'Limite de tentativas automáticas atingido', email: SUPPORT_EMAIL },
    };
  }

  private async runTool(
    userId: string | null,
    name: string,
    rawArgs: string,
  ): Promise<{ output: unknown; escalate: { reason: string; email: string } | null }> {
    let args: Record<string, unknown> = {};
    try {
      args = rawArgs ? JSON.parse(rawArgs) : {};
    } catch {
      // ignore malformed args, treated as empty
    }

    try {
      switch (name) {
        case 'get_my_orders': {
          if (!userId) {
            return { output: { error: 'Usuário não autenticado. Peça para ele fazer login.' }, escalate: null };
          }
          const orders = await this.ordersService.findAll(userId);
          return { output: { orders }, escalate: null };
        }
        case 'get_order_details': {
          if (!userId) {
            return { output: { error: 'Usuário não autenticado. Peça para ele fazer login.' }, escalate: null };
          }
          const orderId = Number(args.orderId);
          if (!orderId) return { output: { error: 'orderId inválido' }, escalate: null };
          const order = await this.ordersService.findOne(orderId, userId);
          return { output: { order }, escalate: null };
        }
        case 'escalate_to_human': {
          const reason = typeof args.reason === 'string' ? args.reason : 'Não especificado';
          return {
            output: { acknowledged: true, supportEmail: SUPPORT_EMAIL },
            escalate: { reason, email: SUPPORT_EMAIL },
          };
        }
        default:
          return { output: { error: `Ferramenta desconhecida: ${name}` }, escalate: null };
      }
    } catch (error) {
      this.logger.warn(`Falha ao executar tool ${name}: ${(error as Error).message}`);
      return { output: { error: 'Não foi possível buscar essa informação agora.' }, escalate: null };
    }
  }
}
