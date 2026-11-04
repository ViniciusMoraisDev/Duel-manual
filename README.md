# Duel (Speed Duel, jogo manual)

App web instalável (PWA) para duelar no formato Speed Duel de forma manual: 3 zonas de monstro, 1 zona extra por jogador,
3 zonas de mágica/armadilha, 2 zonas de pêndulo, Cemitério, Banidas, Deck e Extra Deck. Cartas vêm do banco YGOPRODeck
(novos lançamentos aparecem sozinhos). Inclui criador de cartas custom e importação de .ydk.

## Publicar no GitHub Pages
1. Crie conta em github.com e clique em New repository (nome: `duel-manual`, público).
2. Extraia o ZIP no celular/PC. Em "uploading an existing file", envie TODOS os arquivos (index.html tem que ficar na raiz).
3. Settings > Pages > Source: Deploy from a branch > main / (root) > Save.
4. Aguarde ~1 minuto. O endereço será `https://SEU-USUARIO.github.io/duel-manual/`.

## Instalar no celular
- Android (Chrome): abrir o endereço > menu (3 pontos) > Instalar app.
- iPhone (Safari): Compartilhar > Adicionar à Tela de Início.

## Como jogar
Toque numa carta para ver em tamanho grande e abrir as ações. Para invocar/baixar, escolha a ação e toque numa zona vazia.
Botões: Desfazer, Comprar, Moeda, Dado, Lado (vira a mesa para o outro jogador). Toque nos LP para dano/cura e na fase para avançar.

## Novidades (v4)
- Deck principal de 20 a 30 cartas e deck adicional de até 9.
- Filtro: tipo de monstro (Fusão, Sincro, Xyz, Link, Pêndulo, Ritual, Normal, Tuner), escala de Pêndulo, atributo, nível. Ao escolher Magias ou Armadilhas aparecem os tipos (Normal, Contínua, Rápida, Equipamento, Campo, Ritual / Normal, Contínua, Resposta).
- Banlist: símbolos 0 (proibida), 1 (limitada) e 2 (semi-limitada) nas cartas, seguindo a lista escolhida (TCG, OCG ou Master Duel). TCG e OCG vêm do YGOPRODeck sempre atualizados; Master Duel vem do MasterDuelMeta.
- Criador de cartas estilo DuelingBook, com prévia da carta, tipo, atributo, nível/rank, escala e efeito de Pêndulo, setas Link, ATK/DEF, tipo de magia/armadilha e ajuste da imagem. Cartas custom podem ser editadas.

## Novidades (v3)
- Montador: a seta ▲/▼ esconde ou mostra filtros e busca (e lembra a escolha). A barra azul com a faixa clara sobe/desce a aba de cartas. Segure uma carta da lista e arraste até o deck. Ao tocar numa carta só aparece "Cards relacionados" (mesmo arquétipo/nome), e dá para arrastar os resultados. Segure uma carta do deck para completar a 2ª e a 3ª cópia; arraste uma carta do deck para a lista para remover.
- Duelo: Deck embaixo à direita (toque: comprar, visualizar, embaralhar, render-se), Cemitério acima, Extra Deck à esquerda, Magia de Campo à esquerda dos monstros, Banidas na linha do meio. Nome e LP dos duelistas na barra de baixo (toque no LP para a calculadora de soma/subtração). Sem Main Phase 2.
- Arraste cartas da mão ou do campo para as zonas. Soltar sobre outra carta empilha: a de cima fica visível e as de baixo aparecem à direita. Toque na pilha para escolher a carta e a ação. Ao mover a carta de cima, as de baixo vão junto.

## Notas
- Imagens vêm de images.ygoprodeck.com e ficam em cache no aparelho. Uso pessoal apenas; para distribuir, hospede as imagens você mesmo.
- Ao atualizar arquivos no GitHub, abra o app online uma vez para receber a versão nova.
- Online (à distância) não está incluído: próximo passo seria WebRTC/servidor.
