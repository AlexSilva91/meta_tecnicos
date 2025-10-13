from app.models.customer import Customer

class CustomerService:
    @staticmethod
    def create_customer(cliente_nome: str, plano: str, id_contrato: str) -> Customer:
        return Customer.create(cliente_nome=cliente_nome, plano=plano, id_contrato=id_contrato)

    @staticmethod
    def get_customer_by_id(customer_id: int) -> Customer | None:
        return Customer.get_by_id(customer_id)

    @staticmethod
    def get_customer_by_contract(id_contrato: str) -> Customer | None:
        return Customer.get_by_contract(id_contrato)

    @staticmethod
    def update_customer(customer_id: int, **kwargs) -> Customer | None:
        return Customer.update(customer_id, **kwargs)

    @staticmethod
    def delete_customer(customer_id: int) -> bool:
        return Customer.delete(customer_id)

    @staticmethod
    def list_customers(limit: int = 50, offset: int = 0):
        return Customer.list(limit=limit, offset=offset)