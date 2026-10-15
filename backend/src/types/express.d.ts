export {};

declare global {
  namespace Express {
    interface Request {
      authUserId?: string;
      authStaffId?: string;
      authStaffType?: 'admin' | 'department';
    }
  }
}