import { RolesEntity } from "@/modules/roles/business/entities/RolesEntity";
import { RolesModel } from "@/modules/roles/data/models/RolesModel";

export const mapRolesModelToEntity = (model: RolesModel): RolesEntity => ({
  id: model.id ?? "",
  name: model.name ?? "",
  description: model.description ?? "",
  createdAt: model.createdAt ?? 0,
  updatedAt: model.updatedAt ?? 0,
});

export const mapRolesEntityToModel = (entity: RolesEntity): RolesModel => ({
  name: entity.name,
  description: entity.description,
  createdAt: entity.createdAt ?? 0,
  updatedAt: entity.updatedAt ?? 0,
});