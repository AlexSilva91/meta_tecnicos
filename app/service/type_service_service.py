from app.models.type_service import TypeService

class TypeServiceService:
    @staticmethod
    def create_type_service(name: str) -> TypeService:
        return TypeService.create(name=name)

    @staticmethod
    def get_type_service_by_id(type_service_id: int) -> TypeService | None:
        return TypeService.get_by_id(type_service_id)

    @staticmethod
    def get_type_service_by_name(name: str) -> TypeService | None:
        return TypeService.get_by_name(name)

    @staticmethod
    def update_type_service(type_service_id: int, **kwargs) -> TypeService | None:
        return TypeService.update(type_service_id, **kwargs)

    @staticmethod
    def delete_type_service(type_service_id: int) -> bool:
        return TypeService.delete(type_service_id)

    @staticmethod
    def list_type_services(limit: int = 50, offset: int = 0):
        return TypeService.list(limit=limit, offset=offset)