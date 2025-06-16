// get-user.decorator.spec.ts
import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { getUserDecoratorFactory } from './get-user.decorator';

describe('GetUser Decorator', () => {
  let mockExecutionContext: any;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'admin',
  };

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: mockUser }),
    };
  });

  it('should return the full user object when no data key is provided', () => {
    const result = getUserDecoratorFactory(undefined, mockExecutionContext as ExecutionContext);
    expect(result).toEqual(mockUser);
  });

  it('should return a specific property when a valid key is provided', () => {
    const result = getUserDecoratorFactory('email', mockExecutionContext as ExecutionContext);
    expect(result).toBe(mockUser.email);
  });

  it('should return undefined when a non-existent key is provided', () => {
    const result = getUserDecoratorFactory('nonExistent', mockExecutionContext as ExecutionContext);
    expect(result).toBeUndefined();
  });

  it('should throw InternalServerErrorException if user is not found in request', () => {
    (mockExecutionContext.getRequest as jest.Mock).mockReturnValue({});

    expect(() =>
      getUserDecoratorFactory(undefined, mockExecutionContext as ExecutionContext),
    ).toThrow(InternalServerErrorException);
  });

  it('should throw InternalServerErrorException if user is null', () => {
    (mockExecutionContext.getRequest as jest.Mock).mockReturnValue({ user: null });

    expect(() =>
      getUserDecoratorFactory(undefined, mockExecutionContext as ExecutionContext),
    ).toThrow(InternalServerErrorException);
  });
});
