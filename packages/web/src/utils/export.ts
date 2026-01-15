/**
 * Export utilities for generating CSV files
 */

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data: any[], headers: string[]): string => {
  const rows = [headers.join(',')];

  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header];
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    rows.push(values.join(','));
  });

  return rows.join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export employers data to CSV
 */
export const exportEmployersToCSV = (employers: any[]): void => {
  const headers = [
    'firstName',
    'lastName',
    'email',
    'position',
    'department',
    'employeeNumber',
    'baselineHoursPerWeek',
    'isActive',
  ];

  const csvContent = convertToCSV(employers, headers);
  const filename = `employers-${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export days off to CSV
 */
export const exportDaysOffToCSV = (daysOff: any[]): void => {
  const formattedData = daysOff.map((day) => ({
    date: new Date(day.date).toLocaleDateString('es-PY'),
    employerName: `${day.employer?.firstName} ${day.employer?.lastName}`,
    type: day.type,
    isPaid: day.isPaid ? 'Pagado' : 'No Pagado',
    deductionAmount: day.deductionAmount || 0,
    reason: day.reason || '',
  }));

  const headers = [
    'date',
    'employerName',
    'type',
    'isPaid',
    'deductionAmount',
    'reason',
  ];

  const csvContent = convertToCSV(formattedData, headers);
  const filename = `days-off-${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export check-ins to CSV
 */
export const exportCheckInsToCSV = (checkIns: any[]): void => {
  const formattedData = checkIns.map((checkIn) => ({
    date: new Date(checkIn.date).toLocaleDateString('es-PY'),
    timestamp: new Date(checkIn.timestamp).toLocaleString('es-PY'),
    employerName: `${checkIn.employer?.firstName || ''} ${checkIn.employer?.lastName || ''}`,
    eventType: checkIn.eventType,
    notes: checkIn.notes || '',
  }));

  const headers = ['date', 'timestamp', 'employerName', 'eventType', 'notes'];

  const csvContent = convertToCSV(formattedData, headers);
  const filename = `check-ins-${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export metrics to CSV
 */
export const exportMetricsToCSV = (metrics: any[]): void => {
  const headers = [
    'employerName',
    'hoursWorked',
    'hoursGained',
    'hoursLost',
    'salaryDeduction',
  ];

  const csvContent = convertToCSV(metrics, headers);
  const filename = `metrics-${new Date().toISOString().split('T')[0]}.csv`;

  downloadCSV(csvContent, filename);
};
