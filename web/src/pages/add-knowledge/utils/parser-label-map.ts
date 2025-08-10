/**
 * 解析器标签映射工具函数
 */

export const PARSER_LABEL_MAP = {
  naive: '通用文档',
  manual: '复合文档',
  table: '表格',
  one: '深度理解',
  qa: '问答对',
} as const;

/**
 * 获取解析器的中文标签
 * @param parserId 解析器ID
 * @returns 中文标签
 */
export const getParserLabel = (parserId: string): string => {
  return (
    PARSER_LABEL_MAP[parserId as keyof typeof PARSER_LABEL_MAP] || parserId
  );
};

/**
 * 为解析器列表添加中文标签
 * @param parserList 原始解析器列表
 * @returns 带有中文标签的解析器列表
 */
export const mapParserListLabels = (
  parserList: Array<{ value: string; label: string }>,
) => {
  return parserList.map((item) => ({
    ...item,
    label: getParserLabel(item.value),
  }));
};
