export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL now points to our Supabase Auth page
export const getLoginUrl = () => {
  return '/auth';
};
