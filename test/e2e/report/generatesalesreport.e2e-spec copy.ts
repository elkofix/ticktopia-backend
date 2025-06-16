import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as request from 'supertest';
import { AppModule } from "../../../src/app.module";
import { User } from "../../../src/auth/entities/user.entity";
import { Repository } from "typeorm";
import { ValidRoles } from "../../../src/auth/enums/valid-roles.enum";
import { error } from "console";

const testingCreateUser = {
    email: 'gusrep2@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

const testingCreateClient = {
    email: 'gussrep2@mail.com',
    password: 'Abc12345',
    name: 'Testing',
    lastname: 'user',
};

var adminToken = "";
var clientToken = "";

describe('ReportModule generateSalesReport (e2e)', () => {
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

        const responseClient = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testingCreateClient);


        adminToken = responseAdmin.body.token;
        clientToken = responseClient.body.token;
        await userRepository.update(
            { email: testingCreateUser.email },
            { roles: ['admin'] },
        );
    }, 10000);

    afterEach(async () => {
        await userRepository.delete({ email: testingCreateUser.email });
        await userRepository.delete({ email: testingCreateClient.email });

        await app.close();
    });

    it('/report/salesn (GET) - getSalesReport - admin', async () => {
        const response = await request(app.getHttpServer())
            .get(`/report/sales`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send();
        expect(response.status).toBe(200);
    });

    it('/report/sales (GET) - getSalesReport - client', async () => {
        const response = await request(app.getHttpServer())
            .get(`/report/sales`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send();
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: `User ${testingCreateClient.email} needs a valid role`, error: "Forbidden", statusCode: 403 })
    });

    it('/report/sales (GET) - getSalesReport - unauthenticated', async () => {
        const response = await request(app.getHttpServer())
            .get(`/report/sales`)
            .send();
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: `Unauthorized`, statusCode: 401 })
    });


});