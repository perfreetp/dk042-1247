import { useState } from 'react';
import {
  AlertTriangle, Package, TrendingUp, CheckCircle, XCircle, Clock,
  ChevronRight, Star, Play, FileText, History, ChevronDown, ChevronUp,
  User, Calendar
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';
import {
  getStatusColor, getStatusText, formatDate, formatDateTime
} from '@/utils/helpers';
import type { Draft, EvaluationDecision } from '@/types';

type TabType = 'pending' | 'evaluated';

export default function EvaluationPage() {
  const drafts = useAppStore((state) => state.drafts);
  const submitEvaluation = useAppStore((state) => state.submitEvaluation);
  const updateDraftStatus = useAppStore((state) => state.updateDraftStatus);
  const getEvaluationByDraftId = useAppStore((state) => state.getEvaluationByDraftId);
  const getEvaluationsByDraftId = useAppStore((state) => state.getEvaluationsByDraftId);
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showHistoryDraftId, setShowHistoryDraftId] = useState<string | null>(null);
  
  const [evaluationForm, setEvaluationForm] = useState({
    riskScore: 50,
    resourceScore: 50,
    benefitScore: 50,
    decision: 'pending' as EvaluationDecision,
    comment: '',
  });

  const getDraftById = useAppStore((state) => state.getDraftById);
  const selectedDraft = selectedDraftId ? getDraftById(selectedDraftId) : null;

  const pendingDrafts = drafts.filter((d) => d.status === 'pending');
  const evaluatedDrafts = drafts.filter((d) => 
    ['approved', 'rejected', 'running', 'completed'].includes(d.status)
  );

  const handleEvaluate = (draft: Draft) => {
    setSelectedDraftId(draft.id);
    const existingEvaluation = getEvaluationByDraftId(draft.id);
    if (existingEvaluation) {
      setEvaluationForm({
        riskScore: existingEvaluation.riskScore,
        resourceScore: existingEvaluation.resourceScore,
        benefitScore: existingEvaluation.benefitScore,
        decision: existingEvaluation.decision,
        comment: existingEvaluation.comment,
      });
    } else {
      setEvaluationForm({
        riskScore: 50,
        resourceScore: 50,
        benefitScore: 50,
        decision: 'pending',
        comment: '',
      });
    }
    setShowEvaluateModal(true);
  };

  const handleSubmitEvaluation = () => {
    if (!selectedDraftId) return;
    
    submitEvaluation(selectedDraftId, {
      riskScore: evaluationForm.riskScore,
      resourceScore: evaluationForm.resourceScore,
      benefitScore: evaluationForm.benefitScore,
      decision: evaluationForm.decision,
      comment: evaluationForm.comment,
    });
    
    setShowEvaluateModal(false);
    setSelectedDraftId(null);
  };

  const handleStartRunning = (draftId: string) => {
    updateDraftStatus(draftId, 'running');
  };

  const handleGoToReview = () => {
    window.location.hash = '#/review';
  };

  const ScoreGauge = ({ score, label, color }: { score: number; label: string; color: string }) => (
    <div className="text-center">
      <div className={`relative w-20 h-20 mx-auto mb-2 rounded-full bg-deep-indigo-800/60 border-4 ${color}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${score * 2.89} 289`}
            className={color.replace('border-', 'text-')}
          />
        </svg>
      </div>
      <p className="text-sm text-deep-indigo-300">{label}</p>
    </div>
  );

  const displayDrafts = activeTab === 'pending' ? pendingDrafts : evaluatedDrafts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display gradient-text mb-2">
          可行性评估
        </h1>
        <p className="text-deep-indigo-300">
          对活动草案进行风险评估和资源评估，做出决策
        </p>
      </div>

      <div className="glass-card p-2 inline-flex">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-neon-purple-500/30 to-cyber-cyan-500/30 text-white'
              : 'text-deep-indigo-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            待评估 ({pendingDrafts.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('evaluated')}
          className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'evaluated'
              ? 'bg-gradient-to-r from-neon-purple-500/30 to-cyber-cyan-500/30 text-white'
              : 'text-deep-indigo-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            已评估 ({evaluatedDrafts.length})
          </div>
        </button>
      </div>

      <div className="space-y-4">
        {displayDrafts.map((draft, index) => {
          const latestEval = getEvaluationByDraftId(draft.id);
          const evalHistory = getEvaluationsByDraftId(draft.id);
          const showHistory = showHistoryDraftId === draft.id;
          
          return (
            <div
              key={draft.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="glass-card glass-card-hover animate-slide-up overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">
                        {draft.title}
                      </h3>
                      <span className={`tag ${getStatusColor(draft.status)} border`}>
                        {getStatusText(draft.status)}
                      </span>
                      {latestEval && (
                        <span
                          className={`tag border ${
                            latestEval.decision === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {latestEval.decision === 'approved' ? '评估通过' : '评估驳回'}
                        </span>
                      )}
                      {evalHistory.length > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-deep-indigo-700/50 text-deep-indigo-300">
                          共 {evalHistory.length} 次
                        </span>
                      )}
                    </div>
                    <p className="text-deep-indigo-300 text-sm line-clamp-1 mb-2">
                      {draft.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-deep-indigo-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {draft.owner || '未指定'}
                      </span>
                      {draft.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(draft.startDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {draft.status === 'approved' && (
                      <button
                        onClick={() => handleStartRunning(draft.id)}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5"
                      >
                        <Play className="w-4 h-4" />
                        开始执行
                      </button>
                    )}
                    {draft.status === 'completed' && (
                      <button
                        onClick={handleGoToReview}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        去复盘
                      </button>
                    )}
                    <button
                      onClick={() => handleEvaluate(draft)}
                      className="flex items-center gap-1 text-cyber-cyan-400 hover:text-cyber-cyan-300 transition-colors bg-cyber-cyan-500/10 border border-cyber-cyan-500/30 rounded-lg px-3 py-2 text-sm"
                    >
                      <Star className="w-4 h-4" />
                      {latestEval ? '重新评估' : '评估'}
                    </button>
                  </div>
                </div>

                {latestEval ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-neon-purple-500/10">
                      <ScoreGauge
                        score={latestEval.riskScore}
                        label="风险评分"
                        color="border-rose-500/50"
                      />
                      <ScoreGauge
                        score={latestEval.resourceScore}
                        label="资源评分"
                        color="border-amber-500/50"
                      />
                      <ScoreGauge
                        score={latestEval.benefitScore}
                        label="收益评分"
                        color="border-emerald-500/50"
                      />
                    </div>
                    <div className="text-xs text-deep-indigo-500 px-1">
                      评估人：{latestEval.evaluator} · {formatDateTime(latestEval.evaluatedAt)}
                    </div>

                    {latestEval.comment && (
                      <div className="p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                        <p className="text-xs text-deep-indigo-500 mb-1">评估意见：</p>
                        <p className="text-sm text-deep-indigo-200">{latestEval.comment}</p>
                      </div>
                    )}

                    {evalHistory.length > 1 && (
                      <>
                        <button
                          onClick={() => setShowHistoryDraftId(showHistory ? null : draft.id)}
                          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-deep-indigo-400 hover:text-deep-indigo-200 border border-dashed border-deep-indigo-700 rounded-xl transition-colors"
                        >
                          <History className="w-4 h-4" />
                          {showHistory ? '收起历史评估' : `查看历史评估（${evalHistory.length - 1}条）`}
                          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showHistory && (
                          <div className="space-y-2">
                            {evalHistory.slice(1).map((evalRec) => (
                              <div
                                key={evalRec.id}
                                className="p-4 rounded-xl bg-deep-indigo-900/40 border border-neon-purple-500/10 opacity-80"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`tag border text-xs ${
                                        evalRec.decision === 'approved'
                                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                      }`}
                                    >
                                      {evalRec.decision === 'approved' ? '通过' : '驳回'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-deep-indigo-500">
                                    {evalRec.evaluator} · {formatDateTime(evalRec.evaluatedAt)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                  <div className="text-center">
                                    <span className="text-xs text-deep-indigo-500">风险</span>
                                    <p className="text-base font-bold text-rose-400">{evalRec.riskScore}</p>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-xs text-deep-indigo-500">资源</span>
                                    <p className="text-base font-bold text-amber-400">{evalRec.resourceScore}</p>
                                  </div>
                                  <div className="text-center">
                                    <span className="text-xs text-deep-indigo-500">收益</span>
                                    <p className="text-base font-bold text-emerald-400">{evalRec.benefitScore}</p>
                                  </div>
                                </div>
                                {evalRec.comment && (
                                  <p className="text-xs text-deep-indigo-400 mt-2 pt-2 border-t border-neon-purple-500/10">
                                    {evalRec.comment}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 py-4 border-t border-neon-purple-500/10">
                    <div className="flex items-center gap-2 text-deep-indigo-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{draft.resourceRequirements.length} 项资源需求</span>
                    </div>
                    <div className="flex items-center gap-2 text-deep-indigo-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{draft.metrics.length} 个验证指标</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayDrafts.length === 0 && (
        <div className="text-center py-16">
          <CheckCircle className="w-16 h-16 text-deep-indigo-600 mx-auto mb-4" />
          <p className="text-deep-indigo-400 text-lg">
            {activeTab === 'pending' ? '暂无待评估的活动' : '暂无已评估的活动'}
          </p>
          <p className="text-deep-indigo-500 text-sm mt-2">
            {activeTab === 'pending'
              ? '活动草案提交评估后会出现在这里'
              : '评估后的活动会出现在这里'}
          </p>
        </div>
      )}

      <Modal
        isOpen={showEvaluateModal && !!selectedDraft}
        onClose={() => {
          setShowEvaluateModal(false);
          setSelectedDraftId(null);
        }}
        title={getEvaluationByDraftId(selectedDraftId || '') ? '重新评估' : '可行性评估'}
        size="lg"
      >
        {selectedDraft && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {selectedDraft.title}
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-deep-indigo-400">
                  负责人：{selectedDraft.owner || '未指定'}
                </span>
                <span className={`tag ${getStatusColor(selectedDraft.status)} border text-xs`}>
                  {getStatusText(selectedDraft.status)}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-deep-indigo-200">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    风险评分
                  </label>
                  <span className="text-lg font-bold text-rose-400">
                    {evaluationForm.riskScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={evaluationForm.riskScore}
                  onChange={(e) =>
                    setEvaluationForm({
                      ...evaluationForm,
                      riskScore: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-deep-indigo-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-xs text-deep-indigo-500 mt-1">
                  <span>低风险</span>
                  <span>高风险</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-deep-indigo-200">
                    <Package className="w-4 h-4 text-amber-400" />
                    资源评分
                  </label>
                  <span className="text-lg font-bold text-amber-400">
                    {evaluationForm.resourceScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={evaluationForm.resourceScore}
                  onChange={(e) =>
                    setEvaluationForm({
                      ...evaluationForm,
                      resourceScore: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-deep-indigo-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-deep-indigo-500 mt-1">
                  <span>资源充足</span>
                  <span>资源紧张</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-deep-indigo-200">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    收益评分
                  </label>
                  <span className="text-lg font-bold text-emerald-400">
                    {evaluationForm.benefitScore}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={evaluationForm.benefitScore}
                  onChange={(e) =>
                    setEvaluationForm({
                      ...evaluationForm,
                      benefitScore: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-deep-indigo-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-deep-indigo-500 mt-1">
                  <span>收益较低</span>
                  <span>收益很高</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-3">
                决策建议
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setEvaluationForm({ ...evaluationForm, decision: 'approved' })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    evaluationForm.decision === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
                      : 'bg-deep-indigo-800/40 text-deep-indigo-300 border border-deep-indigo-700 hover:border-emerald-500/30'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  通过
                </button>
                <button
                  onClick={() =>
                    setEvaluationForm({ ...evaluationForm, decision: 'rejected' })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    evaluationForm.decision === 'rejected'
                      ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/50'
                      : 'bg-deep-indigo-800/40 text-deep-indigo-300 border border-deep-indigo-700 hover:border-rose-500/30'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  驳回
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                评估意见
              </label>
              <textarea
                placeholder="填写评估意见和建议..."
                value={evaluationForm.comment}
                onChange={(e) =>
                  setEvaluationForm({ ...evaluationForm, comment: e.target.value })
                }
                className="input-field resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowEvaluateModal(false);
                  setSelectedDraftId(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmitEvaluation}
                disabled={evaluationForm.decision === 'pending'}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                提交评估
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
