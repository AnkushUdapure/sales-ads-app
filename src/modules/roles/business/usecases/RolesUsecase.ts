import { RolesRepository } from "@/modules/roles/business/repositories/RolesRepository";
import { RolesEntity } from "@/modules/roles/business/entities/RolesEntity";
import { mapRolesEntityToModel, mapRolesModelToEntity } from "@/modules/roles/data/mappers/RolesMapper";

export class RolesUsecase {
  constructor(private repo: RolesRepository) {}

  async create(entity: RolesEntity): Promise<RolesEntity> {
    const model = mapRolesEntityToModel(entity);
    const result = await this.repo.create(model);
    if (!result.status || !result.data) throw new Error(result.message || "Failed to create");
    return mapRolesModelToEntity(result.data);
  }

  async fetchAll(): Promise<RolesEntity[]> {
    const result = await this.repo.fetchAll();
    if (!result.status || !result.data) throw new Error(result.message || "Failed to fetch");
    return result.data.map(mapRolesModelToEntity);
  }
}