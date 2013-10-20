
class Calculator:
    def add(self, x, y):
        return x+y
        
    def substract(self, x, y):
        return x-y
    
    def multiply(self, x, y):
        return x * y
        
    def divide(self, x, y):
        return x /y
        
__debug__ = true

calc = Calculator()

assert calc.add(1,2) == 3
assert calc.substract(3, 1) == 2
assert calc.multiply(3, 2) == 6
assert calc.divide(4, 2) == 2

