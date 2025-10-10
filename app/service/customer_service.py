from app.models.customer import Customer

class CustomerService:
    @staticmethod
    def create_customer(name: str, contract_id: str, internet_package: str) -> Customer:
        return Customer.create(name, contract_id, internet_package)

    @staticmethod
    def get_customer_by_id(customer_id: int) -> Customer | None:
        return Customer.get_by_id(customer_id)

    @staticmethod
    def get_customer_by_contract(contract_id: str) -> Customer | None:
        return Customer.get_by_contract(contract_id)

    @staticmethod
    def update_customer(customer_id: int, **kwargs) -> Customer | None:
        return Customer.update(customer_id, **kwargs)

    @staticmethod
    def delete_customer(customer_id: int) -> bool:
        return Customer.delete(customer_id)

    @staticmethod
    def list_customers(limit: int = 50, offset: int = 0):
        return Customer.list(limit=limit, offset=offset)
