
// import { Context } from 'koa';
// import Users from '../server/controllers/users';
// import UserService from '../server/services/userService';
// import { Token } from '../server/controllers/token';

// jest.mock('axios');
// jest.mock('qs');
// jest.mock('../services/userService');
// jest.mock('../middlewares/token');
// jest.mock('../database/config');

// const MockedUserService = UserService as jest.MockedClass<typeof UserService>;
// const MockedToken = Token as jest.MockedClass<typeof Token>;

// describe('Users', () => {
//   let users: Users;
//   let ctx: Context;

//   beforeEach(() => {
//     users = new Users();
//     ctx = {} as Context;
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//   });

//   describe('loginUser', () => {
//     it('successful login', async () => {
//       MockedUserService.prototype.loginUser.mockResolvedValue(true);

//       await users.loginUser(ctx);

//       expect(MockedUserService.prototype.loginUser).toHaveBeenCalledWith();
//       expect(MockedToken.prototype.setJwtTokenInCookie).toHaveBeenCalledWith(ctx);
//       expect(ctx.body).toEqual({ success: true, token: '토큰 생성 성공' });
//     });

//     it('failed login', async () => {
//       MockedUserService.prototype.loginUser.mockResolvedValue(false);

//       await users.loginUser(ctx);

//       expect(MockedUserService.prototype.loginUser).toHaveBeenCalledWith();
//       expect(MockedToken.prototype.setJwtTokenInCookie).not.toHaveBeenCalled();
//       expect(ctx.body).toEqual({ success: false, message: '로그인 실패' });
//     });

//     it('login error', async () => {
//       MockedUserService.prototype.loginUser.mockRejectedValue(new Error('Login Error'));

//       await users.loginUser(ctx);

//       expect(MockedUserService.prototype.loginUser).toHaveBeenCalledWith();
//       expect(MockedToken.prototype.setJwtTokenInCookie).not.toHaveBeenCalled();
//       expect(ctx.body).toEqual({ success: false, message: '로그인 실패' });
//     });
//   });

// });