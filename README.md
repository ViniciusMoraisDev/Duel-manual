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

## Novidades (v2)
- Montador de deck: arraste a barra azul (com a faixa clara) para subir/descer a aba de cartas. Segure uma carta da lista e arraste até o deck para adicionar; arraste uma carta do deck para a lista para remover.
- Campo: Deck e Extra Deck no campo (Deck embaixo à direita, Cemitério acima dele, Extra Deck à esquerda, Banidas à esquerda da linha de monstros). As zonas de Mágica/Armadilha das pontas são as zonas de Pêndulo, com os cristais e a escala.
- Arraste cartas da mão (ou do campo, ou de dentro do Cemitério/Extra Deck segurando) para as zonas. Soltar em zona ocupada permite colocar por cima ou embaixo (material Xyz). Em "Materiais" escolha qual carta retirar.

## Notas
- Imagens vêm de images.ygoprodeck.com e ficam em cache no aparelho. Uso pessoal apenas; para distribuir, hospede as imagens você mesmo.
- Ao atualizar arquivos no GitHub, abra o app online uma vez para receber a versão nova.
- Online (à distância) não está incluído: próximo passo seria WebRTC/servidor.
