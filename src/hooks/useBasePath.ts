import { useAuth } from "./useAuth";

/** Returns "/staff" or "/shopkeeper" based on logged-in role */
export function useBasePath() {
  const { role } = useAuth();
  return role === "STAFF" ? "/staff" : "/shopkeeper";
}
