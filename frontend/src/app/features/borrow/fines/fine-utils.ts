export const calculateCurrentFine = (dueDate: string, dailyRate: number = 5) => {
    const now = new Date();
    const due = new Date(dueDate);

    // Set times to midnight for accurate day difference
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    // If not overdue yet, fine is 0
    if (now <= due) return 0;

    const diffInTime = now.getTime() - due.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

    return diffInDays * dailyRate;
};
