import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Minus, BookOpen, Lightbulb, Target,
  Calendar, ChevronRight, Plus, Edit3, X, Save, FileText, ArrowLeft
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';
import { formatDate, formatDateTime } from '@/utils/helpers';
import type { Draft, ActualMetric } from '@/types';

export default function ReviewPage() {
  const drafts = useAppStore((state) => state.drafts);
  const reviews = useAppStore((state) => state.reviews);
  const submitReview = useAppStore((state) => state.submitReview);
  const getReviewByDraftId = useAppStore((state) => state.getReviewByDraftId);
  const getDraftById = useAppStore((state) => state.getDraftById);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fromParam, setFromParam] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    actualMetrics: [] as ActualMetric[],
    summary: '',
    lessonsLearned: '',
    improvements: '',
  });
  
  const completedDrafts = drafts.filter((d) => d.status === 'completed');
  const reviewedDraftIds = reviews.map((r) => r.draftId);
  const unreviewedDrafts = completedDrafts.filter((d) => !reviewedDraftIds.includes(d.id));

  const selectedDraft = selectedDraftId ? getDraftById(selectedDraftId) : null;

  const getMetricTrend = (actual: number, target: number) => {
    if (target <= 0) return { icon: Minus, color: 'text-deep-indigo-400', label: '持平' };
    const diff = ((actual - target) / target) * 100;
    if (diff > 5) return { icon: TrendingUp, color: 'text-emerald-400', label: `+${diff.toFixed(1)}%` };
    if (diff < -5) return { icon: TrendingDown, color: 'text-rose-400', label: `${diff.toFixed(1)}%` };
    return { icon: Minus, color: 'text-deep-indigo-400', label: '持平' };
  };

  const initReviewForm = (draft: Draft, existingReview?: ReturnType<typeof getReviewByDraftId>) => {
    if (existingReview) {
      setReviewForm({
        actualMetrics: JSON.parse(JSON.stringify(existingReview.actualMetrics)),
        summary: existingReview.summary,
        lessonsLearned: existingReview.lessonsLearned,
        improvements: existingReview.improvements,
      });
    } else {
      const metrics: ActualMetric[] = draft.metrics.map((m) => ({
        id: m.id,
        name: m.name,
        actual: 0,
        target: m.target,
        unit: m.unit,
      }));
      setReviewForm({
        actualMetrics: metrics,
        summary: '',
        lessonsLearned: '',
        improvements: '',
      });
    }
  };

  const clearUrlParams = () => {
    setSearchParams({});
    setFromParam(false);
  };

  useEffect(() => {
    const draftId = searchParams.get('draftId');
    const action = searchParams.get('action');
    if (draftId) {
      const draft = getDraftById(draftId);
      if (draft) {
        setSelectedDraftId(draftId);
        setFromParam(true);
        if (action === 'edit') {
          const existingReview = getReviewByDraftId(draftId);
          initReviewForm(draft, existingReview);
          setIsEditing(true);
          setShowDetailModal(false);
          setShowCreateModal(true);
        } else {
          setIsEditing(false);
          setShowCreateModal(false);
          setShowDetailModal(true);
        }
      }
    }
  }, [searchParams, getDraftById, getReviewByDraftId]);

  const handleViewDetail = (draft: Draft) => {
    setSelectedDraftId(draft.id);
    setShowDetailModal(true);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!selectedDraft) return;
    const existingReview = getReviewByDraftId(selectedDraft.id);
    initReviewForm(selectedDraft, existingReview);
    setIsEditing(true);
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  const handleOpenCreateReview = (draft: Draft) => {
    const existingReview = getReviewByDraftId(draft.id);
    initReviewForm(draft, existingReview);
    setSelectedDraftId(draft.id);
    setShowCreateModal(true);
  };

  const handleSubmitReview = () => {
    if (!selectedDraftId) return;
    
    submitReview(selectedDraftId, {
      actualMetrics: reviewForm.actualMetrics,
      summary: reviewForm.summary,
      lessonsLearned: reviewForm.lessonsLearned,
      improvements: reviewForm.improvements,
    });
    
    setShowCreateModal(false);
    setIsEditing(false);
    clearUrlParams();
  };

  const updateActualMetric = (metricId: string, actual: number) => {
    setReviewForm({
      ...reviewForm,
      actualMetrics: reviewForm.actualMetrics.map((m) =>
        m.id === metricId ? { ...m, actual } : m
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display gradient-text mb-2">
          复盘页
        </h1>
        <p className="text-deep-indigo-300">
          活动结束后登记效果数据和经验总结
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedDrafts.length}</p>
              <p className="text-sm text-deep-indigo-400">已完成活动</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cyber-cyan-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyber-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{reviews.length}</p>
              <p className="text-sm text-deep-indigo-400">已复盘</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{unreviewedDrafts.length}</p>
              <p className="text-sm text-deep-indigo-400">待复盘</p>
            </div>
          </div>
        </div>
      </div>

      {unreviewedDrafts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            待复盘活动
          </h2>
          <div className="space-y-3">
            {unreviewedDrafts.map((draft, index) => (
              <div
                key={draft.id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="glass-card glass-card-hover animate-slide-up overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{draft.title}</h3>
                      <p className="text-sm text-deep-indigo-400">
                        {draft.endDate ? `结束于 ${formatDate(draft.endDate)}` : '已完成'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenCreateReview(draft)}
                    className="btn-primary text-sm py-2 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    填写复盘
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyber-cyan-400" />
          复盘记录
        </h2>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <BookOpen className="w-16 h-16 text-deep-indigo-600 mx-auto mb-4" />
              <p className="text-deep-indigo-400 text-lg">暂无复盘记录</p>
              <p className="text-deep-indigo-500 text-sm mt-2">
                活动结束后可以在这里填写复盘
              </p>
            </div>
          ) : (
            reviews.map((review, index) => {
              const draft = getDraftById(review.draftId);
              if (!draft) return null;

              return (
                <div
                  key={review.id}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="glass-card glass-card-hover animate-slide-up overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div className="flex-1 cursor-pointer" onClick={() => handleViewDetail(draft)}>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyber-cyan-400 transition-colors">
                          {draft.title}
                        </h3>
                        <p className="text-sm text-deep-indigo-400">
                          更新于 {formatDateTime(review.completedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDraftId(draft.id);
                            handleStartEdit();
                          }}
                          className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                        >
                          <Edit3 className="w-4 h-4" />
                          继续编辑
                        </button>
                        <button
                          onClick={() => handleViewDetail(draft)}
                          className="p-2 rounded-lg hover:bg-white/10 text-deep-indigo-400 hover:text-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4 cursor-pointer" onClick={() => handleViewDetail(draft)}>
                      {review.actualMetrics.slice(0, 3).map((metric) => {
                        const trend = getMetricTrend(metric.actual, metric.target);
                        const TrendIcon = trend.icon;
                        return (
                          <div
                            key={metric.id}
                            className="p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10"
                          >
                            <p className="text-xs text-deep-indigo-400 mb-1">
                              {metric.name}
                            </p>
                            <div className="flex items-end justify-between">
                              <span className="text-xl font-bold text-white">
                                {metric.actual}
                                <span className="text-xs font-normal text-deep-indigo-400 ml-1">
                                  {metric.unit}
                                </span>
                              </span>
                              <div className={`flex items-center gap-0.5 text-xs ${trend.color}`}>
                                <TrendIcon className="w-3 h-3" />
                                {trend.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-sm text-deep-indigo-300 line-clamp-2 cursor-pointer" onClick={() => handleViewDetail(draft)}>
                      {review.summary || '暂无总结，点击继续编辑补录'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={showDetailModal && !!selectedDraft}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDraftId(null);
          clearUrlParams();
        }}
        title=""
        size="xl"
      >
        {selectedDraft && (() => {
          const review = getReviewByDraftId(selectedDraft.id);
          if (!review) return null;

          return (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  {fromParam && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedDraftId(null);
                        clearUrlParams();
                        navigate(-1);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-deep-indigo-400 hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedDraft.title}</h2>
                    <p className="text-sm text-deep-indigo-400">
                      复盘更新于 {formatDateTime(review.completedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStartEdit}
                  className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  编辑复盘
                </button>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyber-cyan-400" />
                  效果数据
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {review.actualMetrics.map((metric) => {
                    const trend = getMetricTrend(metric.actual, metric.target);
                    const TrendIcon = trend.icon;
                    return (
                      <div
                        key={metric.id}
                        className="p-4 rounded-xl bg-gradient-to-br from-deep-indigo-800/60 to-deep-indigo-900/60 border border-neon-purple-500/20"
                      >
                        <p className="text-sm text-deep-indigo-400 mb-2">
                          {metric.name}
                        </p>
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-2xl font-bold text-white">
                            {metric.actual}
                            <span className="text-sm font-normal text-deep-indigo-400 ml-1">
                              {metric.unit}
                            </span>
                          </span>
                          <div className={`flex items-center gap-1 ${trend.color}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{trend.label}</span>
                          </div>
                        </div>
                        <div className="text-xs text-deep-indigo-500">
                          目标：{metric.target} {metric.unit}
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-deep-indigo-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-neon-purple-500 to-cyber-cyan-400 transition-all"
                            style={{
                              width: `${metric.target > 0 ? Math.min((metric.actual / metric.target) * 100, 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyber-cyan-400" />
                  活动总结
                </h4>
                <p className="text-deep-indigo-300 leading-relaxed whitespace-pre-wrap">
                  {review.summary || '暂无总结'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  经验教训
                </h4>
                <p className="text-deep-indigo-300 leading-relaxed whitespace-pre-wrap">
                  {review.lessonsLearned || '暂无'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyber-cyan-500/10 border border-cyber-cyan-500/20">
                <h4 className="font-semibold text-cyber-cyan-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  优化建议
                </h4>
                <p className="text-deep-indigo-300 leading-relaxed whitespace-pre-wrap">
                  {review.improvements || '暂无'}
                </p>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={showCreateModal && !!selectedDraft}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedDraftId(null);
          setIsEditing(false);
          clearUrlParams();
        }}
        title={isEditing ? '编辑复盘' : '填写复盘'}
        size="xl"
      >
        {selectedDraft && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
              <h3 className="font-semibold text-white">{selectedDraft.title}</h3>
              <p className="text-sm text-deep-indigo-400 mt-1">
                {selectedDraft.description || '暂无描述'}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-cyber-cyan-400" />
                实际效果数据
              </h4>
              {reviewForm.actualMetrics.length === 0 ? (
                <p className="text-deep-indigo-500 text-sm p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                  该草案未设置验证指标，可在活动草案页补录后再填写实际数据
                </p>
              ) : (
                <div className="space-y-3">
                  {reviewForm.actualMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10"
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <span className="text-sm font-medium text-white">
                          {metric.name}
                        </span>
                        <span className="text-xs text-deep-indigo-500">
                          目标：{metric.target} {metric.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={metric.actual}
                          onChange={(e) =>
                            updateActualMetric(metric.id, Number(e.target.value))
                          }
                          className="input-field flex-1"
                          placeholder="实际数值"
                        />
                        <span className="text-deep-indigo-400 text-sm w-12">
                          {metric.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                活动总结
              </label>
              <textarea
                placeholder="总结活动整体效果..."
                value={reviewForm.summary}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, summary: e.target.value })
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                经验教训
              </label>
              <textarea
                placeholder="这次活动有哪些经验教训值得吸取..."
                value={reviewForm.lessonsLearned}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, lessonsLearned: e.target.value })
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                优化建议
              </label>
              <textarea
                placeholder="对未来活动有什么优化建议..."
                value={reviewForm.improvements}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, improvements: e.target.value })
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedDraftId(null);
                  setIsEditing(false);
                  clearUrlParams();
                }}
                className="btn-secondary flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button onClick={handleSubmitReview} className="btn-primary flex items-center gap-1.5">
                <Save className="w-4 h-4" />
                {isEditing ? '保存修改' : '提交复盘'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
