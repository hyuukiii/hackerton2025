// src/utils/dateUtils.ts

/**
* 날짜를 YYYY.MM.DD 형식으로 포맷팅
* @param date Date 객체
* @returns 포맷팅된 날짜 문자열 (예: 2025.7.27)
*/
export const formatDateKorean = (date: Date): string => {
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();

return `${year}.${month}.${day}`;
};

/**
* 날짜를 YYYY.MM.DD (요일) 형식으로 포맷팅
* @param date Date 객체
* @returns 포맷팅된 날짜 문자열 (예: 2025.7.27 (일))
*/
export const formatDateKoreanWithDay = (date: Date): string => {
const days = ['일', '월', '화', '수', '목', '금', '토'];
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const dayOfWeek = days[date.getDay()];

return `${year}.${month}.${day} (${dayOfWeek})`;
};

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 포맷팅
 * @param date Date 객체
 * @returns 포맷팅된 날짜 문자열 (예: 2025년 7월 27일)
 */
export const formatDateKoreanFull = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜를 MM.DD 형식으로 포맷팅
 * @param date Date 객체
 * @returns 포맷팅된 날짜 문자열 (예: 7.27)
 */
export const formatDateShort = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${month}.${day}`;
};

/**
 * 타임스탬프를 상대적 시간으로 변환
 * @param timestamp 타임스탬프
 * @returns 상대적 시간 문자열 (예: 방금 전, 5분 전, 1시간 전)
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return formatDateKorean(new Date(timestamp));
};