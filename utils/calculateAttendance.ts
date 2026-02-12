export interface SubjectAttendance {
  subjectName: string;
  totalClasses: number;
  classesAttended: number;
  percentage: number;
  status: 'Safe' | 'Warning' | 'No Classes';
  classesToAttend: number;
  classesToBunk: number;
}

export const calculateAttendance = (
  subject: string,
  total: number,
  present: number,
  targetPercentage: number = 75
): SubjectAttendance => {
  if (total === 0) {
    return {
      subjectName: subject,
      totalClasses: 0,
      classesAttended: 0,
      percentage: 100,
      status: 'No Classes',
      classesToAttend: 0,
      classesToBunk: 0,
    };
  }

  const currentPercentage = (present / total) * 100;
  const isSafe = currentPercentage + 0.0001 >= targetPercentage;

  let classesToAttend = 0;
  let classesToBunk = 0;

  if (!isSafe) {
    const numerator = (targetPercentage * total) - (100 * present);
    const denominator = 100 - targetPercentage;
    classesToAttend = Math.max(0, Math.ceil(numerator / denominator));
  } else {
    const numerator = (100 * present) - (targetPercentage * total);
    classesToBunk = Math.max(0, Math.floor(numerator / targetPercentage));
  }

  return {
    subjectName: subject,
    totalClasses: total,
    classesAttended: present,
    percentage: parseFloat(currentPercentage.toFixed(2)),
    status: isSafe ? 'Safe' : 'Warning',
    classesToAttend,
    classesToBunk
  };
};