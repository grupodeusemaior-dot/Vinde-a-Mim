# Renova-me Deus Meu — Biblioteca de leitura diária

## Testar no VS Code
1. Extraia o ZIP para uma pasta.
2. Abra a pasta `renova-me-devocionais` no VS Code.
3. Instale a extensão **Live Server**.
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.
5. Para testar a instalação/offline, use `http://localhost` fornecido pelo Live Server. O modo `file://` não ativa Service Worker.

## Publicar no GitHub Pages
1. Envie todos os arquivos e pastas deste projeto para a raiz de um repositório GitHub.
2. Em Settings → Pages, selecione Deploy from a branch, escolha `main` e `/ (root)`.
3. Aguarde a publicação e abra o endereço HTTPS gerado.

## Regra de leitura
Cada módulo começa a contar os dias na primeira abertura naquele aparelho: capítulo 1 fica disponível imediatamente; cada virada de data local libera mais um capítulo. Os capítulos já liberados continuam acessíveis. A apresentação, quando existente, está incluída no JSON como conteúdo editorial, mas não consome um dia de capítulo.

## Observação importante sobre a data
Como esta é uma aplicação estática, sem servidor ou autenticação, o controle diário usa a data do aparelho e armazenamento local. O código impede regressão simples da data, mas não consegue impedir que alguém adiante manualmente o relógio do celular. Uma validação antifraude real exigiria um serviço de backend; isso também afetaria a experiência offline.

## Offline
O Service Worker guarda a interface e os quatro JSONs em cache após o primeiro carregamento bem-sucedido. Abra cada módulo uma vez com internet para garantir que os dados foram carregados. A primeira instalação e o primeiro cache precisam de conexão.

## Conteúdo
Os JSONs foram extraídos dos quatro DOCX enviados nesta conversa. Foram mantidos os parágrafos e títulos dos capítulos encontrados no documento. Resumos, introduções, sumários, mensagens do autor e conclusões não foram incluídos como capítulos. As apresentações identificadas foram preservadas separadamente.


## Versão 2 — interface de aplicativo
- Módulos apresentados em lista vertical para uso com uma mão.
- Barra inferior fixa: Início, Leitura, Créditos e Site.
- Ícone PNG próprio e tela de abertura com a arte Vinde a Mim.
- Navegação Anterior/Próxima agora permite percorrer todos os capítulos do módulo. Isso substitui o bloqueio de capítulos futuros da versão anterior; a marcação diária continua sendo calculada, mas não restringe a navegação.
