import { PointGrade } from '../dtos';

export function calculatePointGrade(pointGrade: PointGrade, score) {
  switch (true) {
    case 0 < score && score < 4:
      if (!pointGrade['F']) {
        pointGrade['F'] = 0;
      }
      pointGrade['F'] += 1;
      break;
    case 4 <= score && score < 4.8:
      if (!pointGrade['D']) {
        pointGrade['D'] = 0;
      }
      pointGrade['D'] += 1;
      break;
    case 4.8 <= score && score < 5.5:
      if (!pointGrade['D+']) {
        pointGrade['D+'] = 0;
      }
      pointGrade['D+'] += 1;
      break;
    case 5.5 <= score && score < 6.3:
      if (!pointGrade['C']) {
        pointGrade['C'] = 0;
      }
      pointGrade['C'] += 1;
      break;
    case 6.3 <= score && score < 7.0:
      if (!pointGrade['C+']) {
        pointGrade['C+'] = 0;
      }
      pointGrade['C+'] += 1;
      break;
    case 7.0 <= score && score < 7.8:
      if (!pointGrade['B']) {
        pointGrade['B'] = 0;
      }
      pointGrade['B'] += 1;
      break;
    case 7.8 <= score && score < 8.5:
      if (!pointGrade['B+']) {
        pointGrade['B+'] = 0;
      }
      pointGrade['B+'] += 1;
      break;
    case 8.5 <= score && score < 9.0:
      if (!pointGrade['A']) {
        pointGrade['A'] = 0;
      }
      pointGrade['A'] += 1;
      break;
    case 9.0 <= score && score < 10.0:
      if (!pointGrade['A+']) {
        pointGrade['A+'] = 0;
      }
      pointGrade['A+'] += 1;
      break;
  }
  return pointGrade;
}

export function randomScore(min = 4, max = 9) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
