import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Auth service', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);

        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });
  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signUp('test@test.mail.com', 'asfsdf');

    expect(user.password).not.toEqual('asfsdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signUp('asdf@test.com', 'asdf');

    await expect(service.signUp('asdf@test.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called an unused email', async () => {
    await expect(service.signIn('test@tesr', 'asd-fsa')).rejects.toThrow(
      NotFoundException,
    );
  });
  it('throws if invalid password is provided', async () => {
    await service.signUp('test@tesr', 'asdfsa');
    await expect(service.signUp('test@tesr', 'asd-fsa')).rejects.toThrow(
      BadRequestException,
    );
  });
  it('should return a user if correct password is provided', async () => {
    await service.signUp('test@test', 'test');

    const user = await service.signIn('test@test', 'test');

    expect(user).toBeDefined();
  });
});
