export function reverseString(str: string) {
  return str.split('').reverse().join('');
}

export function hiddenEmail(email: string) {
  let hiddenEmail = '';
  for (let i = 0; i < email.length; i++) {
    if (i > 2 && i < email.indexOf('@')) {
      hiddenEmail += '*';
    } else {
      hiddenEmail += email[i];
    }
  }
  return hiddenEmail;
}

export function randomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
