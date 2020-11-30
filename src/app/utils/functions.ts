export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/gim;
  if (email == '' || !re.test(email)) {
    return false;
  }
  return true;
}
