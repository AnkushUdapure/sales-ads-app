import { RolesUsecase } from "@/modules/roles/business/usecases/RolesUsecase";
import { RolesEntity } from "@/modules/roles/business/entities/RolesEntity";

export const useRolesHook = (repo: RolesUsecase) => {
  const usecase = new RolesUsecase(repo);

  const create = async (data: RolesEntity) => await usecase.create(data);
  const getAll = async () => await usecase.fetchAll();

  return { create, getAll };
};