import { Session } from "@/db/schema";
import type { EUserRole } from "@/types/common/roles";

export type AuthSession = Session & {
  user: {
    id: string;
    name?: string;
    email?: string;
    role?: EUserRole;
  };
} | null;
