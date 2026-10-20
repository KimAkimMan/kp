export type CreateUserInput = {
  nama: string;
  email: string;
  role: "Admin" | "Operator" | "Pimpinan";
  password: string;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">> & {
  password?: string;
};
