import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { SigninDto, SignupDto } from '../src/auth/dto/auth.dto';
import { EditUserDto } from '../src/user/dto/editUser.dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'bookmark/dto';

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
          .inspect()
          .stores('userToken', 'access_token');
      });
      it('should throw invalid credentials', () => {
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
  });
  describe('User', () => {
    describe('Get users/me', () => {
      it('should get current user', () => {
        return (
          pactum
            .spec()
            .get('/users/me')
            // .withHeaders({
            //   Authorization: 'Bearer $S{userToken}',
            // })
            .withBearerToken('$S{userToken}')
            .expectStatus(200)
        );
      });
    });
    describe('Edit User', () => {
      it('should be able to edit user', () => {
        const dto: EditUserDto = {
          email: 'rolly@gmail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withBearerToken('$S{userToken}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .inspect();
      });
    });
  });
  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks with empty []', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userToken}')
          .expectBody([])
          .inspect();
      });
    });

    describe('Create bookmark', () => {
      it('should create bookmark', () => {
        const dto: CreateBookmarkDto = {
          title: 'this is testing',
          link: 'https://docs.nestjs.com/cli/overview',
        };
        return pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken('$S{userToken}')
          .withBody(dto)
          .expectStatus(201)
          .inspect()
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userToken}')
          .expectJsonLength(1)
          .inspect();
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withBearerToken('$S{userToken}')
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Edit bookmark', () => {
      it('should edit bookmark', () => {
        const dto: EditBookmarkDto = {
          title: 'this is bookmark edited version',
        };
        return pactum
          .spec()
          .patch('/bookmarks/$S{bookmarkId}')
          .withBearerToken('$S{userToken}')
          .withBody(dto)
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{bookmarkId}')
          .withBearerToken('$S{userToken}')
          .expectStatus(200)
          .expectBody('')
          .inspect();
      });
    });
  });
});
