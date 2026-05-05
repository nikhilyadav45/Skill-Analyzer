import { prisma } from '../../database/prisma';
import { RegisterDto } from './dto/auth.dto';

export class AuthRepository {
  public async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async createUser(data: RegisterDto) {
    return prisma.user.create({
      data,
    });
  }

  public async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
