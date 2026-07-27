# Portfólio — camada criativa 3D

Documento técnico do que foi adicionado sobre a base original.
Nenhum conteúdo do portfólio foi removido — só ganhou forma nova.

## Arquivos

| Arquivo | Papel |
|---|---|
| `assets/js/interactions.js` | Boot, HUD, radar, esfera de tecnologias, reveal, magnetismo |
| `assets/js/hero-core.js` | **Parado** — núcleo 3D do hero (Three.js), removido da página |
| `assets/css/enhance.css` | Toda a camada visual nova (carrega depois de `style.css`) |
| `assets/js/script.js` | Base original — tema, matrix rain, cursor, tilt, FABs |
| `assets/css/style.css` | Base original — intocada |

## 1. Núcleo 3D do hero — removido

Existiu um núcleo neural em WebGL atrás da foto de perfil. Foi retirado a
pedido: o fundo competia com a foto. O módulo continua em
`assets/js/hero-core.js`, sem ser carregado pelo HTML — se voltar, basta
recriar a `<div id="hero-3d">`, reestilizá-la e reincluir Three.js + o script.
O hero hoje é o card de perfil sozinho, com o terminal digitando comandos ao
lado.

## 2. Esfera 3D de tecnologias (skills)

Substituiu a lista de tags. Cada tecnologia é um `<span>` real projetado em
esfera por distribuição de Fibonacci, com perspectiva, profundidade de campo
(blur no fundo) e `z-index` por profundidade. Arrastável, com auto-rotação e
inércia. São 29 nós — elementos de texto reais, portanto legíveis para busca e
leitores de tela. Legenda por cor: domínio principal / stack / IA.

Ao lado da esfera fica o **índice textual** (`.tech-index`): a mesma stack em
formato escaneável, agrupada em Linguagens / Frameworks / Dados & infra /
Produto. É a versão que um recrutador lê de relance.

## 2b. Radar de competências (Hard Skills)

Substituiu as barras de progresso. SVG com 8 eixos — Back-end, PHP/Laravel,
Node.js, React/Next, Front-end, Linguagem C, Git e IA aplicada — com o polígono
se abrindo a partir do centro na entrada. Vértices coloridos por nível
(confortável / familiarizado / em aprendizado); ao focar um ponto com o mouse ou
o teclado, o nome completo e o percentual aparecem no leitor abaixo. Competências
de processo em evolução ficam na faixa final do card.

Os dados vivem no HTML (`data-name`, `data-level`, `data-value`) e as
coordenadas foram calculadas na geração — para mexer nos valores, recalcule os
`points` dos polígonos.

## 3. Revelação por scroll — reescrita

O sistema antigo dependia do GSAP: se ele falhasse, seções ficavam presas em
`opacity: 0` (por isso existiam os `style="opacity:1 !important"` no HTML).

Agora: `IntersectionObserver` + CSS. O CSS só esconde quando o JS confirma que
sabe revelar (`html.js-reveal`), há timeout de segurança de 6s, e sem JS tudo
aparece normalmente. As barras de habilidade preenchem junto com o card.

## 3b. Fundo — malha técnica

O fundo antigo empilhava quatro camadas decorativas: matrix rain em canvas
(katakana caindo), quatro orbs coloridos com parallax e tint por seção,
scanlines do `style.css` e outra camada de scanlines do `enhance.css`. Ficou
enfeitado demais.

Hoje são duas camadas, ambas em CSS puro:

- `.bg-grid` — duas grades sobrepostas (fina a 44px, mestra a 220px) como papel
  milimetrado de projeto, com máscara radial dissolvendo as bordas. Desliza a
  4% da velocidade do scroll, o suficiente para dar profundidade sem chamar
  atenção;
- `.bg-veil` — véu radial estático no topo e no rodapé.

O grão sutil de `body::before` (do `style.css`) permaneceu. As scanlines de
`body::after` foram desligadas pelo `enhance.css`. Sem canvas, sem
`requestAnimationFrame` — o fundo passou a custar praticamente zero e troca de
tema apenas pelas variáveis `--grid-fine`, `--grid-major` e `--veil-*`.

## 4. Demais adições

- **Boot screen** com sequência de inicialização, pulável (clique/ESC) e com
  failsafe duplo — timeout no JS e animação de fallback no CSS.
- **HUD**: barra de progresso de scroll e navegação lateral em pontos com rótulo.
- **Botões magnéticos** que atraem para o cursor (desligados em toque).
- **Cards de projeto** com profundidade real: `translateZ` nos elementos internos
  acompanhando o tilt, faixa holográfica e spotlight seguindo o cursor.
- **Fun cards** viram no eixo Y revelando texto no verso (acessível por teclado).
- **Títulos de seção** com índice numerado e efeito de decodificação (scramble).
- **Terminal do hero** digitando comandos em rotação.
- **Contadores** animados nas estatísticas.
- **Textura global**: grão + varredura sutil.

## Acessibilidade e performance

- `prefers-reduced-motion` desliga scramble, magnetismo, digitação, rotação
  automática da esfera e o loop 3D.
- Ponteiro grosso (toque) desliga magnetismo e spotlight.
- Loops 3D e da esfera pausam fora da viewport.
- Nada do conteúdo depende de JS para ficar visível.

## Rodando local

```bash
python3 -m http.server 8000
# ou, no Windows: start.bat
```
