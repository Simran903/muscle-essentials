import type { UserRole, UserStatus } from "database";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  sessionId: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
