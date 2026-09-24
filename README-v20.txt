ACHOU, COMPROU — v0.20 ONLINE

STATUS
- Conectado ao Supabase exclusivo do Achou, Comprou.
- Projeto: achou-comprou (São Paulo).
- Login e cadastro reais via Supabase Auth.
- Cadastro de comerciante cria a conta e vincula a loja ao usuário.
- Produtos, variações, ofertas, favoritos, loja e estatísticas usam o banco online.
- Logos, capas e fotos de produtos usam Supabase Storage.
- Catálogo público mostra somente lojas aprovadas e itens disponíveis.

NOVIDADES DA v0.20
- Recuperação de senha concluída dentro do próprio app: o link do e-mail abre a tela para definir a nova senha.
- Confirmação de cadastro retorna para o app quando ele estiver publicado em HTTP/HTTPS.
- Nova loja passa a ser vinculada automaticamente à cidade Grajaú-MA e à categoria principal correta.
- Novos produtos passam a receber categoria estruturada no banco para melhorar busca e organização.
- Fluxo online mantém cliente, lojista e administrador separados.
- Cache PWA atualizado para v0.20.

SEGURANÇA
- RLS ativo nas 11 tabelas do sistema.
- Loja nova começa como aguardando aprovação e no plano Grátis.
- O lojista não pode se autoaprovar nem ativar Premium sozinho.
- Plano Grátis limitado no banco a 2 produtos e 2 ofertas por mês.
- Chave usada no navegador é somente a chave pública/publishable do Supabase.
- Nenhuma senha de banco ou chave secreta fica no aplicativo.

PLANOS
- Grátis — R$ 0,00/mês: até 2 produtos e 2 ofertas/mês.
- Premium — R$ 49,90/mês: produtos e ofertas ilimitados, destaque, prioridade, estatísticas e página completa.
- Premium + Banner — R$ 59,90/mês: tudo do Premium + banner principal da Home.

CIDADE INICIAL
- Grajaú - MA.

OBSERVAÇÃO
- Os dados de demonstração permanecem apenas como fallback visual para desenvolvimento. Quando o backend está ativo, os dados reais do Supabase substituem o catálogo local.
