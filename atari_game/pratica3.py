# Código com erro de indentação proposital:
def greet(name):
print("Hello, " + name)  # Erro: esta linha não está indentada, causando IndentationError
if name == "Alice":
print("Nice to see you!")  # Erro: esta linha também não está indentada

# Explicação do erro:
# Em Python, a indentação é obrigatória para definir blocos de código (como o corpo de uma função ou estruturas de controle como if).
# Se uma linha dentro de uma função ou bloco não for indentada corretamente (geralmente com 4 espaços), o interpretador Python levanta um IndentationError.
# No código acima, as linhas print não estão indentadas, então o Python não reconhece que elas fazem parte da função greet.

# Versão corrigida:
def greet(name):
    print("Hello, " + name)  # Agora indentada corretamente
    if name == "Alice":
        print("Nice to see you!")  # Indentada dentro do if

# Exemplo de uso:
greet("Alice")  # Saída: Hello, Alice \n Nice to see you!
