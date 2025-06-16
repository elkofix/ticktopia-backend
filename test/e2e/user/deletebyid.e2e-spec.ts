import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from 'supertest';
import { AppModule } from "../../../src/app.module";
import { User } from "../../../src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { ValidRoles } from "../../../src/auth/enums/valid-roles.enum";

const testingCreateUser = {
    email: 'gusd@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateClient = {
    email: 'gussd@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateClient2 = {
    email: 'gussd2@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingDeleteClient2 = {
    email: 'gussd3@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

var adminToken = "";
var userToken = "";
var userID = "";
var userID2 = "";
var deleteID = "";
var deleteToken = "";
describe('UserModule DeleteById (e2e)', () => {
    let app: INestApplication;
    let userRepository: Repository<User>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );
        await app.init();
        userRepository = app.get<Repository<User>>(getRepositoryToken(User));

        const responseAdmin = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testingCreateUser);
        adminToken = responseAdmin.body.token;

        const responseUser = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testingCreateClient);

        const responseUser2 = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testingCreateClient2);
        const responseUser3 = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testingDeleteClient2);

        adminToken = responseAdmin.body.token;
        userToken = responseUser.body.token;
        userID = responseUser.body.user.id;
        userID2 = responseUser2.body.user.id;
        deleteID = responseUser3.body.user.id;
        deleteToken = responseUser3.body.token;
        await request(app.getHttpServer())
            .delete(`/auth/users/${deleteID}`)
            .set('Authorization', `Bearer ${deleteToken}`)
            .send(testingDeleteClient2);

        await userRepository.update(
            { email: testingCreateUser.email },
            { roles: ['admin'] },
        );
    }, 10000);

    afterEach(async () => {
        await userRepository.delete({ email: testingCreateUser.email });
        await userRepository.delete({ email: testingCreateClient.email });
        await userRepository.delete({ email: testingCreateClient2.email });
        await userRepository.delete({ email: testingDeleteClient2.email });

        await app.close();
    });

    it('/auth/users/:id (DELETE) - valid credentials - myself', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/auth/users/${userID}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: `User with ID ${userID} has been deactivated successfully`
        });
    });

    it('/auth/users/:id (DELETE) - already deleted - myself', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/auth/users/${deleteID}`)
            .set('Authorization', `Bearer ${deleteToken}`)
            .send();
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: `User is not active`,
            error: 'Unauthorized',
            statusCode: 401
        });
    });

    it('/auth/users/:id (DELETE) - invalid credentials - not myself', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/auth/users/${userID2}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send();
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: `You can only delete yourself`,
            error: 'Unauthorized',
            statusCode: 401
        });
    });

    it('/auth/users/:id (DELETE) - no credentials', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/auth/users/${userID2}`)
            .send();
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: 'Unauthorized',
            statusCode: 401
        });
    });

});