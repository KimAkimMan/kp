export type CreateUserInput = {
  nama: string;
  email: string;
  role: "Admin" | "Operator" | "Pimpinan";
  passwordHash?: string;
};
