import { IsUUID } from "class-validator";

export class ReorderImagesDto {
  @IsUUID('4', { each: true })
  orderIds: string[];
}
