import { RolesModel } from "@/modules/roles/data/models/RolesModel";
import { ApiResponse } from "@/core/apiWrapper";

export interface RolesRepository {
  fetchAll(): Promise<ApiResponse<RolesModel[]>>;
  fetchById(id: string): Promise<ApiResponse<RolesModel>>;
  create(data: RolesModel): Promise<ApiResponse<RolesModel>>;
  update(id: string, data: RolesModel): Promise<ApiResponse<RolesModel>>;
  deleteData(id: string): Promise<ApiResponse<null>>;
}