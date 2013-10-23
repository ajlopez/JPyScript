
a = 2

def foo():
    print("a in foo", a)
    a = 1
    
foo()
print("a in global", a)