export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTagColorClass = (tag: string): string => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('节') || lowerTag.includes('日') || lowerTag.includes('festival')) {
    return 'tag-festival';
  }
  if (lowerTag.includes('付费') || lowerTag.includes('payment') || lowerTag.includes('充值')) {
    return 'tag-payment';
  }
  if (lowerTag.includes('留存') || lowerTag.includes('retention') || lowerTag.includes('活跃')) {
    return 'tag-retention';
  }
  return 'tag-default';
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
    pending: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    approved: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    rejected: 'text-rose-400 bg-rose-500/20 border-rose-500/30',
    running: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    completed: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  };
  return colorMap[status] || colorMap.draft;
};

export const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    pending: '待评估',
    approved: '已通过',
    rejected: '已驳回',
    running: '进行中',
    completed: '已完成',
  };
  return textMap[status] || status;
};

export const getRiskColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };
  return colorMap[level] || colorMap.low;
};

export const getRiskText = (level: string): string => {
  const textMap: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return textMap[level] || level;
};

export const getMaterialTypeText = (type: string): string => {
  const textMap: Record<string, string> = {
    poster: '海报',
    competitor: '竞品',
    sketch: '草图',
    other: '其他',
  };
  return textMap[type] || type;
};

export const getMaterialTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    poster: 'text-cyan-400 bg-cyan-500/15',
    competitor: 'text-rose-400 bg-rose-500/15',
    sketch: 'text-amber-400 bg-amber-500/15',
    other: 'text-purple-400 bg-purple-500/15',
  };
  return colorMap[type] || colorMap.other;
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
