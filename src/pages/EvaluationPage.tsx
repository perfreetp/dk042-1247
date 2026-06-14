import { useState } from 'react';
import { AlertTriangle, Package, TrendingUp, CheckCircle, XCircle, Clock, ChevronRight, Star } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';
import { getStatusColor, getStatusText, formatDate } from '@/utils/helpers';
import type { Draft, EvaluationDecision } from '@/types';

type TabType = 'pending' | 'evaluated';

export default function EvaluationPage() {
  const drafts = useAppStore((state) => state.drafts);
  const evaluations = useAppStore((state) => state.evaluations);
  const submitEvaluation = useAppStore((state) => state.submitEvaluation);
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  
  const [evaluationForm, setEvaluationForm] = useState({
    riskScore: 50,
    resourceScore: 50,
    benefitScore: 50,
    decision: 'pending' as EvaluationDecision,
    comment: '',
  });

  const pendingDrafts = drafts.filter((d) => d.status === 'pending');
  const evaluatedDrafts = drafts.filter((d) => 
    ['approved', 'rejected'].includes(d.status) ||
    evaluations.some((e) => e.draftId === d.id)
  );

  const getEvaluationByDraftId = (draftId: string) => {
    return evaluations.find((e) => e.draftId === draftId);
  };

  const handleEvaluate = (draft: Draft) => {
    setSelectedDraft(draft);
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
    if (!selectedDraft) return;
    
    submitEvaluation(selectedDraft.id, {
      riskScore: evaluationForm.riskScore,
      resourceScore: evaluationForm.resourceScore,
      benefitScore: evaluationForm.benefitScore,
      decision: evaluationForm.decision,
      comment: evaluationForm.comment,
    });
    
    setShowEvaluateModal(false);
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
          const evaluation = getEvaluationByDraftId(draft.id);
          
          return (
            <div
              key={draft.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="glass-card glass-card-hover animate-slide-up overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        {draft.title}
                      </h3>
                      <span className={`tag ${getStatusColor(draft.status)} border`}>
                        {getStatusText(draft.status)}
                      </span>
                    </div>
                    <p className="text-deep-indigo-300 text-sm line-clamp-1">
                      {draft.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEvaluate(draft)}
                    className="flex items-center gap-1 text-cyber-cyan-400 hover:text-cyber-cyan-300 transition-colors"
                  >
                    <span className="text-sm">评估</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {evaluation ? (
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-neon-purple-500/10">
                    <ScoreGauge
                      score={evaluation.riskScore}
                      label="风险评分"
                      color="border-rose-500/50"
                    />
                    <ScoreGauge
                      score={evaluation.resourceScore}
                      label="资源评分"
                      color="border-amber-500/50"
                    />
                    <ScoreGauge
                      score={evaluation.benefitScore}
                      label="收益评分"
                      color="border-emerald-500/50"
                    />
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

                {evaluation && evaluation.comment && (
                  <div className="mt-4 p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                    <p className="text-xs text-deep-indigo-500 mb-1">评估意见：</p>
                    <p className="text-sm text-deep-indigo-200">{evaluation.comment}</p>
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
        onClose={() => setShowEvaluateModal(false)}
        title="可行性评估"
        size="lg"
      >
        {selectedDraft && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {selectedDraft.title}
              </h3>
              <p className="text-sm text-deep-indigo-400">
                负责人：{selectedDraft.owner}
              </p>
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
                onClick={() => setShowEvaluateModal(false)}
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
