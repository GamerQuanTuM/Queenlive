import { IsString } from 'class-validator';

export class MarkAsSeenDto {
  @IsString()
  userId: number;

  @IsString()
  otherUserId: number;
}
