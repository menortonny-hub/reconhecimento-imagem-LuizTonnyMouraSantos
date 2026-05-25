# Código original (com erro):
# def f(l): res = []; [res.append(x) for x in l if x % 2 == 0]; return res
# Problemas: Uso incorreto de list comprehension (cria lista de None), nomes ruins (f, l, res).

# Versão refatorada com list comprehension e nomes melhores:
def filter_even_numbers(numbers_list):
    """
    Filtra e retorna apenas os números pares da lista fornecida.
    """
    return [number for number in numbers_list if number % 2 == 0]

# Exemplo de uso:
print(filter_even_numbers([1, 2, 3, 4, 5, 6]))  # [2, 4, 6]
