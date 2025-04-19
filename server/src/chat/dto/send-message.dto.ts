import { IsString, IsInt } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsInt()
  receiverId: number;
}
