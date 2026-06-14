export const MAX_MEMBER_NUMBER = 99_999_999;

export function formatMemberNumber(memberNumber: number): string {
  return String(memberNumber).padStart(8, "0");
}
