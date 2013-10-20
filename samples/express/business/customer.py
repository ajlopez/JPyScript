
import repository

customer_repository = repository.Repository()

customer_repository.add({ 'name': 'Customer 1', 'address': 'Address 1' })
customer_repository.add({ 'name': 'Customer 2', 'address': 'Address 2' })
customer_repository.add({ 'name': 'Customer 3', 'address': 'Address 3' })

def index(req, res):
    res.render('customerlist', { 'title': 'Customers', 'items': customer_repository.get_all() })

