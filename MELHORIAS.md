# Workspace em todo o portfólio

Camada `world.css` / `world.js`, na branch `codex`:
- Sobre: crachá com profundidade e alternância explícita entre foto e ilustração.
- Habilidades: placa-mãe com três chips selecionáveis e links para projetos reais;
  substitui a esfera anterior, mantendo o índice textual de tecnologias.
- Experiência: caderno cujos capítulos usam os cargos e períodos já existentes.
- Formação: cartucho com seletor de cursos; preserva o status Em progresso.
- Projetos: galeria com notebook, celular ou terminal conforme o projeto escolhido;
  usa títulos, tecnologias, descrições e links dos cards originais. Aproximar muda
  o enquadramento. As interfaces são representações, não capturas reais.
- Contato: terminal com comandos ajuda, email, github, projetos, sobre e limpar;
  gera links, nunca envia mensagens ou executa código. Copiar email usa clipboard
  quando disponível, com alternativa textual em caso de falha.

Interação por mouse é desativada em toque e movimento reduzido. Controles são
nativos (botões/selects/formulário) e operáveis por teclado. Sem JavaScript, o
conteúdo original e links permanecem disponíveis; widgets dependentes ficam
ocultos ou desativados. Nenhuma nova dependência ou modelo Blender foi usado.

---

# Workspace escolhido — acabamento escuro

A versão da mesa foi escolhida e refinada na branch `codex`:
- mesa, monitor e acessórios em grafite;
- teclado e detalhes com iluminação verde;
- monitor com apresentação dos projetos em estilo terminal;
- fundo quase preto e grade discreta;
- tema claro preservado, com os equipamentos ainda escuros.

As interações e os três projetos destacados foram mantidos. O terminal é uma
composição visual ilustrativa; nomes e links continuam ligados aos projetos reais.
A cena continua em CSS, sem modelo Blender ou dependências adicionais.

---

# Conceito 02 — workspace interativo

Implementado na branch `codex`: abertura com mesa em perspectiva CSS, monitor,
teclado, caderno, caneca, planta e porta-retrato. A foto e as estatísticas completas
foram movidas para Sobre. A abertura não tem mais a tela de boot nem o terminal.

- `assets/css/workspace.css`: composição, objetos, responsividade e movimento reduzido.
- `assets/js/workspace.js`: perspectiva pelo mouse, escala e seleção de projetos.
- Monitor: alterna entre três projetos existentes e abre o card correspondente.
- Caderno: experiência; foto: Sobre; caneca: contato.
- Links convencionais também disponíveis abaixo da cena; sem JavaScript os objetos
  continuam navegáveis. Sem animação automática ou dependências novas.
- O terminal desenhado dentro do monitor é ilustrativo, não uma captura do app.

## Próxima etapa com Blender

O MCP Blender não estava disponível durante esta implementação. Esta versão é
um estudo navegável em CSS, não um modelo exportado do Blender. Quando conectado,
modelar a mesa e os objetos com materiais suaves em verde, creme e grafite;
exportar GLB otimizado e manter os links HTML como alternativa acessível.
Capturas reais dos projetos podem substituir a representação ilustrativa do monitor.

## Variação solicitada para depois

Conceito 03: máquina de construir software, com módulos para requisitos, interface,
backend e entrega. Avaliar após o workspace, em uma prévia separada, preservando
este conceito para comparação. Ainda não implementado.

---

Abaixo está o histórico da camada anterior (as descrições de hero e boot foram
substituídas pelo conceito acima).

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
