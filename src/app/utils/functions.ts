export function validateEmail(email: string): boolean {
  const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gim;
  if (email == '' || !re.test(email)) {
    return false;
  }
  return true;
}
