import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard, PassportModule } from '@nestjs/passport';
import { UserRoleGuard } from '../auth/guards/user-role/user-role.guard';
import { SuccessController } from './success.controller';

describe('SuccessController', () => {
    let controller: SuccessController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                PassportModule.register({ defaultStrategy: 'jwt' }), // Importar PassportModule
            ],
            controllers: [SuccessController],
        })
            .overrideGuard(AuthGuard('jwt')) // Sobreescribir el AuthGuard
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .overrideGuard(UserRoleGuard) // Sobreescribir el UserRoleGuard
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<SuccessController>(SuccessController);
    });

    it('should return status', async () => {
        const result = controller.showSuccess()
        expect(result).toEqual(
           "PAGO EXITOSO"
        );
    });


});