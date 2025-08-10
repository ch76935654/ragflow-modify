/**
 * 中国日期格式化工具
 */

export const formatChineseDate = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // 格式：2024年12月15日 14:30
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  } catch (error) {
    return '-';
  }
};

export const formatChineseDateShort = (dateString: string | Date): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 格式：2024年12月15日
    return `${year}年${month}月${day}日`;
  } catch (error) {
    return '-';
  }
};
