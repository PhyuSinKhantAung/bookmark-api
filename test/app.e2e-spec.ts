import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SigninDto, SignupDto } from '../src/auth/dto/auth.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen('3333');
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    describe('Signup', () => {
      it('should signup', () => {
        const dto: SignupDto = {
          email: 'pska@gmail.com',
          password: '123456',
          firstname: 'Phyu',
          lastname: 'Sin',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });
    describe('Signin', () => {
      it('should signin', () => {
        const dto: SigninDto = {
          email: 'pska@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
      it('should throw unauthorized', () => {
        const dto: SigninDto = {
          email: 'pska@gmail.com',
          password: '1234',
        };
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(403)
          .inspect();
      });
      it('should throw email is required', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: '123456',
          })
          .expectStatus(400)
          .inspect();
      });
      it('should throw password is required', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'pska@gmail.com',
          })
          .expectStatus(400)
          .inspect();
      });
    });
    it('should throw user not found', () => {
      return pactum
        .spec()
        .post('/auth/signin')
        .withBody({
          email: 'rolly@gmail.com',
          password: '123456',
        })
        .expectStatus(403)
        .inspect();
    });
  });
  describe('User', () => {
    describe('Get current user/me', () => {});
    describe('Edit User', () => {});
  });
  describe('Bookmark', () => {
    describe('Create bookmark', () => {});
    describe('Get bookmarks', () => {});
    describe('Get bookmark by id', () => {});
    describe('Edit bookmark', () => {});
    describe('Delete bookmark', () => {});
  });
});
