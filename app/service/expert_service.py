from app.models.expert import Expert

class ExpertService:
    @staticmethod
    def create_expert(nome: str) -> Expert:
        return Expert.create(nome=nome)

    @staticmethod
    def get_expert_by_id(expert_id: int) -> Expert | None:
        return Expert.get_by_id(expert_id)

    @staticmethod
    def get_expert_by_name(nome: str) -> Expert | None:
        return Expert.get_by_name(nome)

    @staticmethod
    def update_expert(expert_id: int, **kwargs) -> Expert | None:
        return Expert.update(expert_id, **kwargs)

    @staticmethod
    def delete_expert(expert_id: int) -> bool:
        return Expert.delete(expert_id)

    @staticmethod
    def list_experts(limit: int = 50, offset: int = 0):
        return Expert.list(limit=limit, offset=offset)