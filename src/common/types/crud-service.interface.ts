import { PaginatedResponse } from "./paginated-response";

export interface CrudService<T, CreateDto, UpdateDto, QueryDto = any> {
  findAll(query: QueryDto): Promise<T[] | PaginatedResponse<T>>;
  findOne(id: string): Promise<T>;
  create(dto: CreateDto): Promise<T>;
  update(id: string, dto: UpdateDto): Promise<T>;
  remove(id: string): Promise<void>;
}
