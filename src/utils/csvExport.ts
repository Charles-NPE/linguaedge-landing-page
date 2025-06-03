
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportStudentStatusToCSV = (
  rows: Array<{
    student: { id: string; full_name: string | null };
    status: "pending" | "submitted" | "late";
    submitted_at?: string | null;
    teacher_public_note?: string | null;
  }>,
  assignmentTitle: string,
  className: string
) => {
  const header = ['Student', 'Status', 'Submitted at', 'Teacher Note'];
  const lines = rows.map(r => [
    `"${r.student.full_name ?? 'Unknown Student'}"`,
    r.status,
    r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '',
    `"${r.teacher_public_note ?? ''}"`
  ]);
  
  const csv = [header, ...lines].map(l => l.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `${assignmentTitle}_${className}.csv`);
};
