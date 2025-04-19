import { IsString } from 'class-validator';

export class GetConversationDto {
  @IsString()
  id: number;
}
