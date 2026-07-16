export const UserRole = {

  HOMEOWNER: "HOMEOWNER",

  CONTRACTOR: "CONTRACTOR",

  ADMIN: "ADMIN",

} as const;


export type UserRole =
  typeof UserRole[keyof typeof UserRole];