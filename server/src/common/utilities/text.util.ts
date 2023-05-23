import { uniq } from 'lodash';

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

export function parseEmail(str: string) {
  const emailMatches = str.match(
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
  );
  if (!emailMatches || !emailMatches.length) {
    return '';
  }
  return emailMatches[0].trim().toLowerCase();
}

export function parsePhone(str: string) {
  const phoneMatches = str.match(/(?:[-+(). ]*\d){10,13}/gm);
  if (!phoneMatches || !phoneMatches.length) {
    return '';
  }
  return phoneMatches[0].trim().toLowerCase();
}

export function parseName(str: string) {
  const arr = str.trim().split('\n');
  if (!arr.length) {
    return '';
  }
  const [name] = arr;
  return name.includes('.') ? name.split('.')[1].trim() : name;
}

export function parseStudentCode(str: string) {
  const codeMatches = str.match(/[ACD]T\d{6}/gm);
  if (!codeMatches) {
    return [];
  }
  return uniq(codeMatches);
}
