export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
};

export type AuthStateValue =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "error"; message: string };

export type AuthAdapter = {
  getCurrentUser: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginAdapter = (credentials: LoginCredentials) => Promise<void>;
