export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    applied:
      "bg-[#E6FFFB] dark:bg-[#122A29] text-teal-700 dark:text-[#86EFAC] border-[#9DECE4] dark:border-[#3A674A]",
    interviewing:
      "bg-[#FEF9C3] dark:bg-[#3A2C17] text-[#92400E] dark:text-[#FACC15] border-[#FDE68A] dark:border-[#B45309]",
    rejected:
      "bg-[#FEE2E2] dark:bg-[#4F232A] text-[#B91C1C] dark:text-[#FCA5A5] border-[#FCA5A5] dark:border-[#9A5050]",
    offer:
      "bg-[#DBEAFE] dark:bg-[#1F3261] text-[#2563EB] dark:text-[#93C5FD] border-[#BFDBFE] dark:border-[#4C7DB4]",
    ghosted:
      "bg-[#F3F4F6] dark:bg-[#1F2937] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600",
    withdrawn:
      "bg-[#E0E7FF] dark:bg-[#2D2F55] text-[#4338CA] dark:text-[#A5B4FC] border-[#C7D2FE] dark:border-[#6366F1]",
  };

  return colors[status] || colors.applied;
}
