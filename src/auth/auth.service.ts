import { ForbiddenException, Injectable } from '@nestjs/common';
// import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: SignupDto) {
    try {
      const hashPassword = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hashPassword,
          firstname: dto.firstname,
          lastname: dto.lastname,
        },
      });

      delete user.hashPassword;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('User not found');

    const isValidPassword = await argon.verify(user.hashPassword, dto.password);
    if (!isValidPassword) throw new ForbiddenException('Credentials incorrect');

    delete user.hashPassword;
    return user;
  }
}
