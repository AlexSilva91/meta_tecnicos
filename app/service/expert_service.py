from app.models.expert import Expert

class ExpertService:
    @staticmethod
    def create_expert(name: str) -> Expert:
        return Expert.create(name)

    @staticmethod
    def get_expert_by_id(expert_id: int) -> Expert | None:
        return Expert.get_by_id(expert_id)

    @staticmethod
    def update_expert(expert_id: int, **kwargs) -> Expert | None:
        return Expert.update(expert_id, **kwargs)

    @staticmethod
    def delete_expert(expert_id: int) -> bool:
        return Expert.delete(expert_id)

    @staticmethod
    def list_experts(limit: int = 50, offset: int = 0):
        return Expert.list(limit=limit, offset=offset)
