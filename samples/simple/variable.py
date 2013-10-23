
a = 2

def foo():
    a = 1
    print("a in foo", a)
    
foo()
print("a in global", a)