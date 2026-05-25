"""
Jogo no Estilo Atari — Nave vs Asteroides
Autor: gerado com auxílio de agente de IA
Dependência: pip install pygame
"""

import pygame
import random
import sys

# ─── Inicialização do Pygame ───────────────────────────────────────────────────
pygame.init()

# ─── Constantes de configuração ───────────────────────────────────────────────
LARGURA, ALTURA = 800, 600          # Dimensões da janela
FPS = 60                            # Frames por segundo
BRANCO   = (255, 255, 255)
PRETO    = (0, 0, 0)
VERMELHO = (220, 50, 50)
AMARELO  = (255, 220, 0)
CIANO    = (0, 220, 255)
CINZA    = (150, 150, 150)
LARANJA  = (255, 140, 0)
VERDE    = (0, 220, 100)

# ─── Criação da janela ────────────────────────────────────────────────────────
tela = pygame.display.set_mode((LARGURA, ALTURA))
pygame.display.set_caption("Nave vs Asteroides — Estilo Atari")
relogio = pygame.time.Clock()

# ─── Fontes ───────────────────────────────────────────────────────────────────
fonte_hud    = pygame.font.SysFont("Courier New", 22, bold=True)
fonte_grande = pygame.font.SysFont("Courier New", 48, bold=True)
fonte_media  = pygame.font.SysFont("Courier New", 28, bold=True)
fonte_pequena = pygame.font.SysFont("Courier New", 20)


# ══════════════════════════════════════════════════════════════════════════════
# CLASSE: Nave do Jogador
# ══════════════════════════════════════════════════════════════════════════════
class Nave(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # Desenha a nave como triângulo estilizado
        self.image_original = pygame.Surface((40, 50), pygame.SRCALPHA)
        self._desenhar_nave(self.image_original)
        self.image = self.image_original.copy()
        self.rect  = self.image.get_rect()
        self.rect.centerx = LARGURA // 2
        self.rect.bottom   = ALTURA - 20
        self.velocidade = 6

    def _desenhar_nave(self, surface):
        """Desenha o gráfico da nave (triângulo com detalhe)."""
        # Corpo principal — triângulo ciano
        pontos = [(20, 0), (0, 50), (40, 50)]
        pygame.draw.polygon(surface, CIANO, pontos)
        # Borda branca
        pygame.draw.polygon(surface, BRANCO, pontos, 2)
        # Detalhe central
        pygame.draw.line(surface, BRANCO, (20, 10), (20, 40), 2)
        # Janela da cabine
        pygame.draw.circle(surface, AMARELO, (20, 22), 6)

    def update(self, teclas):
        """Move a nave conforme as teclas pressionadas."""
        if teclas[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.velocidade
        if teclas[pygame.K_RIGHT] and self.rect.right < LARGURA:
            self.rect.x += self.velocidade

    def atirar(self):
        """Cria e retorna um projétil na posição do canhão da nave."""
        return Projetil(self.rect.centerx, self.rect.top)


# ══════════════════════════════════════════════════════════════════════════════
# CLASSE: Projétil
# ══════════════════════════════════════════════════════════════════════════════
class Projetil(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((4, 14), pygame.SRCALPHA)
        # Desenha o projétil como retângulo amarelo com brilho
        pygame.draw.rect(self.image, AMARELO, (0, 0, 4, 14), border_radius=2)
        pygame.draw.rect(self.image, BRANCO,  (1, 0, 2, 5),  border_radius=1)
        self.rect = self.image.get_rect(centerx=x, bottom=y)
        self.velocidade = 10

    def update(self, *args):
        """Move o projétil para cima; remove quando sai da tela."""
        self.rect.y -= self.velocidade
        if self.rect.bottom < 0:
            self.kill()


# ══════════════════════════════════════════════════════════════════════════════
# CLASSE: Asteroide
# ══════════════════════════════════════════════════════════════════════════════
class Asteroide(pygame.sprite.Sprite):
    def __init__(self, velocidade_base=2.0):
        super().__init__()
        # Tamanho aleatório entre 25 e 55 px
        self.tamanho = random.randint(25, 55)
        self.image = pygame.Surface((self.tamanho * 2, self.tamanho * 2), pygame.SRCALPHA)
        self._desenhar_asteroide()
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, LARGURA - self.tamanho * 2)
        self.rect.y = -self.tamanho * 2
        # Velocidade sobe conforme dificuldade
        self.velocidade = velocidade_base + random.uniform(-0.3, 0.5)

    def _desenhar_asteroide(self):
        """Desenha um polígono irregular para simular um asteroide."""
        cx, cy = self.tamanho, self.tamanho
        pontos  = []
        import math
        num_pontos = random.randint(7, 11)
        for i in range(num_pontos):
            angulo = (2 * math.pi * i) / num_pontos
            raio   = self.tamanho * random.uniform(0.65, 1.0)
            px = cx + raio * math.cos(angulo)
            py = cy + raio * math.sin(angulo)
            pontos.append((px, py))
        pygame.draw.polygon(self.image, CINZA,    pontos)
        pygame.draw.polygon(self.image, VERMELHO, pontos, 2)
        # Crateras decorativas
        for _ in range(2):
            rx = random.randint(cx - self.tamanho // 2, cx + self.tamanho // 2)
            ry = random.randint(cy - self.tamanho // 2, cy + self.tamanho // 2)
            pygame.draw.circle(self.image, (100, 100, 100), (rx, ry), random.randint(3, 7))

    def update(self, *args):
        """Move o asteroide para baixo."""
        self.rect.y += self.velocidade


# ══════════════════════════════════════════════════════════════════════════════
# CLASSE: Partícula de Explosão
# ══════════════════════════════════════════════════════════════════════════════
class Particula(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.tamanho = random.randint(3, 8)
        self.image   = pygame.Surface((self.tamanho, self.tamanho), pygame.SRCALPHA)
        cor = random.choice([VERMELHO, LARANJA, AMARELO, BRANCO])
        pygame.draw.circle(self.image, cor, (self.tamanho // 2, self.tamanho // 2), self.tamanho // 2)
        self.rect   = self.image.get_rect(center=(x, y))
        self.vx     = random.uniform(-4, 4)
        self.vy     = random.uniform(-5, 1)
        self.vida   = random.randint(20, 45)   # frames de vida
        self.vida_max = self.vida

    def update(self, *args):
        """Move e fade a partícula; remove quando esgotar a vida."""
        self.rect.x += self.vx
        self.rect.y += self.vy
        self.vy     += 0.15   # gravidade leve
        self.vida   -= 1
        # Fade-out proporcional à vida restante
        alpha = int(255 * (self.vida / self.vida_max))
        self.image.set_alpha(alpha)
        if self.vida <= 0:
            self.kill()


# ══════════════════════════════════════════════════════════════════════════════
# FUNÇÕES AUXILIARES
# ══════════════════════════════════════════════════════════════════════════════
def texto_centrado(surface, texto, fonte, cor, cy):
    """Renderiza texto centralizado horizontalmente numa dada altura cy."""
    surf = fonte.render(texto, True, cor)
    rect = surf.get_rect(centerx=LARGURA // 2, y=cy)
    surface.blit(surf, rect)


def desenhar_estrelas(surface, estrelas):
    """Desenha o campo de estrelas de fundo (lista de tuplas (x, y, brilho))."""
    for x, y, b in estrelas:
        pygame.draw.circle(surface, (b, b, b), (x, y), 1)


def gerar_estrelas(n=120):
    """Cria n estrelas em posições e brilhos aleatórios."""
    return [(random.randint(0, LARGURA), random.randint(0, ALTURA),
             random.randint(80, 220)) for _ in range(n)]


def explodir(x, y, todos_sprites, particulas):
    """Cria entre 12 e 20 partículas no ponto de explosão."""
    for _ in range(random.randint(12, 20)):
        p = Particula(x, y)
        todos_sprites.add(p)
        particulas.add(p)


def calcular_velocidade_asteroides(pontuacao):
    """
    Velocidade base aumenta progressivamente com a pontuação.
    Máximo de 6.0 para não tornar impossível.
    """
    return min(2.0 + pontuacao * 0.04, 6.0)


def calcular_intervalo_spawn(pontuacao):
    """
    Intervalo de spawn diminui com o tempo (mais asteroides).
    Mínimo de 45 frames (~0,75 s em 60 FPS).
    """
    return max(45, 90 - int(pontuacao * 0.8))


# ══════════════════════════════════════════════════════════════════════════════
# TELA DE GAME OVER
# ══════════════════════════════════════════════════════════════════════════════
def tela_game_over(surface, pontuacao, estrelas):
    """
    Exibe a tela de Game Over com pontuação final.
    Retorna True se o jogador pressionar R (reiniciar) ou False para sair.
    """
    while True:
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if evento.type == pygame.KEYDOWN:
                if evento.key == pygame.K_r:
                    return True    # Reiniciar
                if evento.key == pygame.K_ESCAPE:
                    return False   # Sair

        # Fundo com estrelas
        surface.fill(PRETO)
        desenhar_estrelas(surface, estrelas)

        # Painel semitransparente central
        painel = pygame.Surface((500, 280), pygame.SRCALPHA)
        painel.fill((10, 10, 40, 200))
        surface.blit(painel, (LARGURA // 2 - 250, ALTURA // 2 - 140))

        texto_centrado(surface, "GAME OVER",           fonte_grande,  VERMELHO, ALTURA // 2 - 120)
        texto_centrado(surface, f"Pontuação: {pontuacao}", fonte_media, AMARELO, ALTURA // 2 - 40)
        texto_centrado(surface, "Pressione  R  para reiniciar", fonte_media, BRANCO,  ALTURA // 2 + 30)
        texto_centrado(surface, "Pressione  ESC  para sair",    fonte_pequena, CINZA,  ALTURA // 2 + 80)

        pygame.display.flip()
        relogio.tick(FPS)


# ══════════════════════════════════════════════════════════════════════════════
# LOOP PRINCIPAL DO JOGO
# ══════════════════════════════════════════════════════════════════════════════
def iniciar_jogo():
    """Configura e executa uma partida completa. Retorna a pontuação final."""

    # ── Grupos de sprites ────────────────────────────────────────────────────
    todos_sprites = pygame.sprite.Group()
    projeteis     = pygame.sprite.Group()
    asteroides    = pygame.sprite.Group()
    particulas    = pygame.sprite.Group()

    # ── Criação da nave ──────────────────────────────────────────────────────
    nave = Nave()
    todos_sprites.add(nave)

    # ── Variáveis de estado ──────────────────────────────────────────────────
    pontuacao          = 0
    cooldown_tiro      = 0        # frames até próximo tiro permitido
    contador_spawn     = 0        # conta frames para spawnar asteroide
    rodando            = True
    estrelas           = gerar_estrelas()

    # ── Loop de jogo ─────────────────────────────────────────────────────────
    while rodando:

        # — Eventos —
        for evento in pygame.event.get():
            if evento.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if evento.type == pygame.KEYDOWN:
                # Atirar (barra de espaço) com cooldown de 15 frames
                if evento.key == pygame.K_SPACE and cooldown_tiro <= 0:
                    proj = nave.atirar()
                    todos_sprites.add(proj)
                    projeteis.add(proj)
                    cooldown_tiro = 15

        # — Atualização do cooldown de tiro —
        if cooldown_tiro > 0:
            cooldown_tiro -= 1

        # — Spawn de asteroides —
        contador_spawn += 1
        intervalo = calcular_intervalo_spawn(pontuacao)
        if contador_spawn >= intervalo:
            contador_spawn = 0
            vel = calcular_velocidade_asteroides(pontuacao)
            ast = Asteroide(vel)
            todos_sprites.add(ast)
            asteroides.add(ast)

        # — Atualização dos sprites —
        teclas = pygame.key.get_pressed()
        nave.update(teclas)
        projeteis.update()
        asteroides.update()
        particulas.update()

        # — Colisão: projétil x asteroide —
        acertos = pygame.sprite.groupcollide(projeteis, asteroides, True, True)
        for proj, lista_ast in acertos.items():
            for ast in lista_ast:
                explodir(ast.rect.centerx, ast.rect.centery, todos_sprites, particulas)
                pontuacao += 1

        # — Colisão: nave x asteroide —
        if pygame.sprite.spritecollide(nave, asteroides, False):
            explodir(nave.rect.centerx, nave.rect.centery, todos_sprites, particulas)
            nave.kill()
            rodando = False

        # — Asteroide saiu pela parte de baixo —
        for ast in asteroides.copy():
            if ast.rect.top > ALTURA:
                ast.kill()
                rodando = False   # Encerra o jogo

        # — Desenho —
        tela.fill(PRETO)
        desenhar_estrelas(tela, estrelas)
        todos_sprites.draw(tela)

        # HUD — Pontuação
        surf_pont = fonte_hud.render(f"PONTUAÇÃO: {pontuacao}", True, VERDE)
        tela.blit(surf_pont, (15, 15))

        # HUD — Nível de dificuldade
        nivel = int(pontuacao // 10) + 1
        surf_nivel = fonte_hud.render(f"NÍVEL: {nivel}", True, CIANO)
        tela.blit(surf_nivel, (15, 42))

        pygame.display.flip()
        relogio.tick(FPS)

    # Pequena pausa para exibir as partículas finais
    for _ in range(60):
        tela.fill(PRETO)
        desenhar_estrelas(tela, estrelas)
        particulas.update()
        particulas.draw(tela)
        pygame.display.flip()
        relogio.tick(FPS)

    return pontuacao, estrelas


# ══════════════════════════════════════════════════════════════════════════════
# PONTO DE ENTRADA
# ══════════════════════════════════════════════════════════════════════════════
def main():
    estrelas = gerar_estrelas()
    while True:
        pontuacao, estrelas = iniciar_jogo()
        reiniciar = tela_game_over(tela, pontuacao, estrelas)
        if not reiniciar:
            break

    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
