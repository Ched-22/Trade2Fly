# Checklist — Regra de devolução

Regra: defeito ou produto diferente do anunciado → vendedor paga o frete de volta. Desistência sem defeito → comprador paga (descontado do reembolso). Prazo de 7 dias para contestar. Só vendedores pessoa física.

## BLOQUEIO

- [ ] **PRIORIDADE MÁXIMA — Fluxo de como o vendedor paga a devolução.** Hoje só fica registrado (`OrderReturn.sellerDebtAmount`); não há cobrança. Decidir: plataforma adianta e cobra depois, ou comprador adianta e vira saldo devedor descontado de repasses futuros. Avaliar também a tela do vendedor, que hoje não participa da disputa.
- [ ] **Validação jurídica** (advogado): risco do art. 49 do CDC contra a plataforma (cobra comissão de 5%, retém o escrow e decide a disputa) e uso do Código Civil (vícios redibitórios, arts. 441–446) entre pessoas físicas.
- [ ] Publicar a política de devolução nos Termos de Uso e no FAQ (hoje só existe o aceite no checkout).
- [ ] Aplicar a migration `20261029120000_order_returns_and_shipping` no banco.

## IMPORTANTE

- [ ] **Prazo de 7 dias pós-Loggi:** hoje conta do envio (`autoCompleteAt`, `ORDER_AUTO_COMPLETE_DAYS=7`). Com o rastreio da Loggi, contar da entrega (`Order.deliveredAt` já existe, falta preencher) e ajustar `submitShipment`/`receiptDecision`.
- [ ] **Loggi — etiqueta reversa:** hoje o admin registra rastreio/etiqueta manualmente. Integrar criação de envio e coleta reversa; trocar a estimativa do frete de volta (= frete de ida) pelo preço real da etiqueta.
- [ ] **Loggi — frete de ida:** o valor já é cobrado e guardado separado (`shippingAmount`, `shippingInsurance`), mas ainda não é repassado/pago à Loggi.
- [ ] Confirmar a regra "frete de ida, seguro e juros do cartão não voltam na desistência" (reembolso = preço do produto − frete de volta).
- [ ] Defeito oculto após os 7 dias: definir se o pedido conclui mesmo assim (decisão atual: sim).
- [ ] Pedidos com retirada em mãos (`deliveryMode=pickup`): sem frete de volta; definir como tratar a devolução.
- [ ] Testar em sandbox: reembolso parcial na Asaas (`refundPayment` com `value`) para Pix e cartão parcelado.

## DESEJÁVEL

- [ ] Vendedor ver o motivo, o status da devolução e confirmar o recebimento (hoje só o admin confirma).
- [ ] Aviso/notificação automática se a devolução ficar parada sem etiqueta ou sem recebimento.
- [ ] Retry automático do Pix de repasse ao vendedor e tratamento de estorno/chargeback no webhook (já listados no checklist de lançamento).
