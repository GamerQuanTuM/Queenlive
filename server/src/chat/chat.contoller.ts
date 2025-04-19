import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/roles.decorator';
import { UserType } from 'src/interface/user.interface';
import { GetConversationDto } from './dto/get-conversation.dto';
import { SocketService } from './socket.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: SocketService) {}

  @Get('conversation/:id')
  async getConversations(
    @GetUser() user: UserType,
    @Param() getConversationDto: GetConversationDto,
  ) {
    const chats = await this.chatService.getConversation(
      user.id,
      getConversationDto.id,
    );
    return chats;
  }
}
