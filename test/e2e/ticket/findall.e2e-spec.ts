import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../../../src/auth/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ValidRoles } from '../../../src/auth/enums/valid-roles.enum';

const UserTest = { email: 'adminupreafae@test.com', password: 'Hola1597!!!', name: 'Update', lastname: 'Admin' }
const UserTestManager = { email: 'adminupreafadase@test.com', password: 'Hola1597!!!', name: 'Update', lastname: 'Admin' }

describe('Tickets - Update (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userRepository: Repository<User>;
  let managerToken: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, }));
    await app.init();

    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(UserTest);
    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send(UserTestManager);
    await userRepository.update(
      { email: UserTestManager.email },
      { roles: [ValidRoles.eventManager] },
    );
    token = res.body.token;
    managerToken = res2.body.token;

  }, 10000);

  afterAll(async () => {
        await userRepository.delete({ email: UserTest.email });
    await userRepository.delete({ email: UserTestManager.email });
    await app.close();
  });
  it('should show all tickets of user', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tickets`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
  });

  it('should not show all tickets of user - no client', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tickets`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send();

    expect(res.status).toBe(403);
  });

  it('should not show all tickets of user - no auth', async () => {
    const res = await request(app.getHttpServer())
      .get(`/tickets`)
      .send();

    expect(res.status).toBe(401);
  });
});
