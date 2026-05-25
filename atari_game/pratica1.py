def is_prime_basic(n):
    """
    Verifica se um número é primo de forma básica.
    Um número primo é maior que 1 e não tem divisores positivos além de 1 e ele mesmo.
    """
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

# Versão otimizada com Clean Code
def is_prime_optimized(n):
    """
    Verifica se um número é primo de forma otimizada.
    Otimizações:
    - Trata casos especiais (n <= 1, n == 2, n par).
    - Verifica divisibilidade apenas até a raiz quadrada de n.
    - Usa loop eficiente.
    """
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    # Verifica apenas números ímpares até sqrt(n)
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

# Exemplos de uso
print(is_prime_basic(7))  # True
print(is_prime_optimized(7))  # True
print(is_prime_basic(10))  # False
print(is_prime_optimized(10))  # False
