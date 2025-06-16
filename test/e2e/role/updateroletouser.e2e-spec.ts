import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from 'supertest';
import { AppModule } from "../../../src/app.module";
import { User } from "../../../src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { ValidRoles } from "../../../src/auth/enums/valid-roles.enum";

const testingCreateUser = {
    email: 'gusr@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateClient = {
    email: 'gussr@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateClient2 = {
    email: 'gussr2@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};


var adminToken = "";
var userToken = "";
var userID = "";
var userID2 = "";
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

        adminToken = responseAdmin.body.token;
        userToken = responseUser.body.token;
        userID = responseUser.body.user.id;
        userID2 = responseUser2.body.user.id;
        await userRepository.update(
            { email: testingCreateUser.email },
            { roles: ['admin'] },
        );
    }, 10000);

    afterEach(async () => {
        await userRepository.delete({ email: testingCreateUser.email });
        await userRepository.delete({ email: testingCreateClient.email });
        await userRepository.delete({ email: testingCreateClient2.email });

        await app.close();
    });

    it('/auth/users/roles/:id (PUT) - valid credentials - admin', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/roles/${userID}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ roles: [ValidRoles.eventManager] });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: userID,
            email: testingCreateClient.email,
            name: testingCreateClient.name,
            lastname: testingCreateClient.lastname,
            isActive: true,
            roles: [ValidRoles.eventManager]
        });
    });

    it('/auth/users/roles/:id (PUT) - valid credentials - admin', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/roles/${userID}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ roles: ["INVALID ROLE"] });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Bad Request",
            message: [
                "each value in roles must be one of the following values: admin, event-manager, client, ticketChecker"
            ],
            statusCode: 400
        });
    });

    it('/auth/users/roles/:id (PUT) - invalid credentials', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/roles/${userID}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ roles: ["INVALID ROLE"] });
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            error: "Forbidden",
            message: `User ${testingCreateClient.email} needs a valid role`,
            statusCode: 403
        });
    });

        it('/auth/users/roles/:id (PUT) - NO credentials', async () => {
        const response = await request(app.getHttpServer())
            .put(`/auth/users/roles/${userID}`)
            .send({ roles: ["INVALID ROLE"] });
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: `Unauthorized`,
            statusCode: 401
        });
    });
});