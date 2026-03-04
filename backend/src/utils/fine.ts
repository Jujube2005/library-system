/**
 * Calculates fine based on due date.
 * Fine rate: 10 THB per day.
 * Returns 0 if not overdue.
 */
export const calculateFine = (dueDateString: string): number => {
    const dueDate = new Date(dueDateString);
    const now = new Date();

    // Set times to midnight to calculate pure days difference
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (today <= due) {
        return 0;
    }

    const diffTime = Math.abs(today.getTime() - due.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays * 10;
};
