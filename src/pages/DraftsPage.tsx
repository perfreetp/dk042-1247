import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, User, Target, Package, Clock, ChevronRight,
  Send, Edit3, X, Save, Play, CheckCircle, FileText, Trash2,
  ChevronDown, ChevronUp, Star, AlertTriangle, TrendingUp, XCircle
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';
import {
  getStatusColor, getStatusText, formatDate, formatDateTime,
  getRiskColor, getRiskText
} from '@/utils/helpers';
import type {
  Draft, DraftStatus, ResourceRequirement, Metric, EvaluationDecision
} from '@/types';

const statusFilters: { value: DraftStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待评估' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已驳回' },
  { value: 'running', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function DraftsPage() {
  const drafts = useAppStore((state) => state.drafts);
  const inspirations = useAppStore((state) => state.inspirations);
  const evaluations = useAppStore((state) => state.evaluations);
  const createDraft = useAppStore((state) => state.createDraft);
  const updateDraft = useAppStore((state) => state.updateDraft);
  const updateDraftStatus = useAppStore((state) => state.updateDraftStatus);
  const submitEvaluation = useAppStore((state) => state.submitEvaluation);
  const getDraftById = useAppStore((state) => state.getDraftById);
  const getEvaluationByDraftId = useAppStore((state) => state.getEvaluationByDraftId);
  const getEvaluationsByDraftId = useAppStore((state) => state.getEvaluationsByDraftId);
  
  const navigate = useNavigate();
  
  const [selectedStatus, setSelectedStatus] = useState<DraftStatus | 'all'>('all');
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEvalHistory, setShowEvalHistory] = useState(false);
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    owner: '',
    startDate: '',
    endDate: '',
    resourceRequirements: [] as ResourceRequirement[],
    metrics: [] as Metric[],
  });
  
  const [evaluationForm, setEvaluationForm] = useState({
    riskScore: 50,
    resourceScore: 50,
    benefitScore: 50,
    decision: 'pending' as EvaluationDecision,
    comment: '',
  });
  
  const [newDraft, setNewDraft] = useState({
    title: '',
    description: '',
    owner: '',
    startDate: '',
    endDate: '',
  });

  const selectedDraft = selectedDraftId ? getDraftById(selectedDraftId) : null;
  const filteredDrafts = drafts.filter(
    (draft) => selectedStatus === 'all' || draft.status === selectedStatus
  );

  const handleViewDetail = (draft: Draft) => {
    setSelectedDraftId(draft.id);
    setShowDetailModal(true);
    setIsEditing(false);
    setShowEvalHistory(false);
  };

  const handleStartEvaluate = (draft: Draft) => {
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
    setSelectedDraftId(draft.id);
    setShowEvaluateModal(true);
  };

  const handleSubmitEvaluationFromDraft = () => {
    if (!selectedDraftId) return;
    submitEvaluation(selectedDraftId, evaluationForm);
    setShowEvaluateModal(false);
  };

  const handleStartEdit = () => {
    if (!selectedDraft) return;
    setEditForm({
      title: selectedDraft.title,
      description: selectedDraft.description,
      owner: selectedDraft.owner,
      startDate: selectedDraft.startDate,
      endDate: selectedDraft.endDate,
      resourceRequirements: JSON.parse(JSON.stringify(selectedDraft.resourceRequirements)),
      metrics: JSON.parse(JSON.stringify(selectedDraft.metrics)),
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDraftId || !editForm.title.trim()) return;
    updateDraft(selectedDraftId, editForm);
    setIsEditing(false);
  };

  const handleSubmitForEvaluation = (draftId: string) => {
    updateDraftStatus(draftId, 'pending');
  };

  const handleStartRunning = (draftId: string) => {
    updateDraftStatus(draftId, 'running');
  };

  const handleComplete = (draftId: string) => {
    updateDraftStatus(draftId, 'completed');
  };

  const handleAddResource = () => {
    setEditForm({
      ...editForm,
      resourceRequirements: [
        ...editForm.resourceRequirements,
        { id: generateId(), type: '', description: '', quantity: 1 },
      ],
    });
  };

  const handleRemoveResource = (id: string) => {
    setEditForm({
      ...editForm,
      resourceRequirements: editForm.resourceRequirements.filter((r) => r.id !== id),
    });
  };

  const handleUpdateResource = (id: string, field: keyof ResourceRequirement, value: string | number) => {
    setEditForm({
      ...editForm,
      resourceRequirements: editForm.resourceRequirements.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    });
  };

  const handleAddMetric = () => {
    setEditForm({
      ...editForm,
      metrics: [
        ...editForm.metrics,
        { id: generateId(), name: '', target: 0, unit: '' },
      ],
    });
  };

  const handleRemoveMetric = (id: string) => {
    setEditForm({
      ...editForm,
      metrics: editForm.metrics.filter((m) => m.id !== id),
    });
  };

  const handleUpdateMetric = (id: string, field: keyof Metric, value: string | number) => {
    setEditForm({
      ...editForm,
      metrics: editForm.metrics.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  };

  const handleCreateDraft = () => {
    if (!newDraft.title.trim()) return;
    const createdDraft = createDraft({
      title: newDraft.title,
      description: newDraft.description,
      owner: newDraft.owner,
      startDate: newDraft.startDate,
      endDate: newDraft.endDate,
      resourceRequirements: [],
      metrics: [],
      relatedInspirationIds: [],
    });
    setNewDraft({ title: '', description: '', owner: '', startDate: '', endDate: '' });
    setShowCreateModal(false);
    if (createdDraft) {
      setSelectedDraftId(createdDraft.id);
      setShowDetailModal(true);
      setIsEditing(false);
    }
  };

  const getRelatedInspirations = (draft: Draft) => {
    return inspirations.filter((ins) => draft.relatedInspirationIds.includes(ins.id));
  };

  const getNextAction = (draft: Draft) => {
    switch (draft.status) {
      case 'draft':
        return { label: '提交评估', action: () => handleSubmitForEvaluation(draft.id), icon: Send, show: true };
      case 'approved':
        return { label: '开始执行', action: () => handleStartRunning(draft.id), icon: Play, show: true };
      case 'running':
        return { label: '标记完成', action: () => handleComplete(draft.id), icon: CheckCircle, show: true };
      case 'completed':
        return {
          label: '去复盘',
          action: () => navigate(`/review?draftId=${draft.id}&action=edit`),
          icon: FileText,
          show: true,
          isExternal: true,
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text mb-2">
            活动草案
          </h1>
          <p className="text-deep-indigo-300">
            管理活动方案，明确资源需求和验证指标
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          新建草案
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === filter.value
                  ? 'bg-gradient-to-r from-neon-purple-500/30 to-cyber-cyan-500/30 text-white border border-neon-purple-500/50'
                  : 'text-deep-indigo-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredDrafts.map((draft, index) => {
          const latestEval = getEvaluationByDraftId(draft.id);
          const nextAction = getNextAction(draft);
          return (
            <div
              key={draft.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="glass-card glass-card-hover animate-slide-up overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 cursor-pointer" onClick={() => handleViewDetail(draft)}>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyber-cyan-400 transition-colors">
                        {draft.title}
                      </h3>
                      <span className={`tag ${getStatusColor(draft.status)} border`}>
                        {getStatusText(draft.status)}
                      </span>
                      {latestEval && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-deep-indigo-700/50 text-deep-indigo-300">
                          评估：{latestEval.decision === 'approved' ? '通过' : latestEval.decision === 'rejected' ? '驳回' : '待定'}
                        </span>
                      )}
                    </div>
                    <p className="text-deep-indigo-300 text-sm line-clamp-1">
                      {draft.description || '暂无描述'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {nextAction?.show && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextAction.action();
                        }}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5"
                      >
                        <nextAction.icon className="w-4 h-4" />
                        {nextAction.label}
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetail(draft)}
                      className="p-2 rounded-lg hover:bg-white/10 text-deep-indigo-400 hover:text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-deep-indigo-400" />
                    <span className="text-deep-indigo-300">{draft.owner || '未指定'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-deep-indigo-400" />
                    <span className="text-deep-indigo-300">
                      {draft.startDate && draft.endDate
                        ? `${formatDate(draft.startDate)} - ${formatDate(draft.endDate)}`
                        : '待定'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-deep-indigo-400" />
                    <span className="text-deep-indigo-300">
                      {draft.resourceRequirements.length} 项资源
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-deep-indigo-400" />
                    <span className="text-deep-indigo-300">
                      {draft.metrics.length} 个指标
                    </span>
                  </div>
                </div>

                {getRelatedInspirations(draft).length > 0 && (
                  <div className="pt-4 mt-4 border-t border-neon-purple-500/10">
                    <p className="text-xs text-deep-indigo-500 mb-2">关联灵感：</p>
                    <div className="flex flex-wrap gap-2">
                      {getRelatedInspirations(draft).map((ins) => (
                        <span
                          key={ins.id}
                          className="text-xs px-2 py-1 rounded-lg bg-neon-purple-500/10 text-neon-purple-300 border border-neon-purple-500/20"
                        >
                          {ins.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDrafts.length === 0 && (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-deep-indigo-600 mx-auto mb-4" />
          <p className="text-deep-indigo-400 text-lg">暂无相关草案</p>
          <p className="text-deep-indigo-500 text-sm mt-2">
            从灵感广场挑选灵感生成活动草案吧
          </p>
        </div>
      )}

      <Modal
        isOpen={showDetailModal && !!selectedDraft}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDraftId(null);
          setIsEditing(false);
        }}
        title=""
        size="xl"
      >
        {selectedDraft && (() => {
          const latestEval = getEvaluationByDraftId(selectedDraft.id);
          const evalHistory = getEvaluationsByDraftId(selectedDraft.id);
          const nextAction = getNextAction(selectedDraft);
          const displayData = isEditing ? editForm : selectedDraft;

          return (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      value={displayData.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full text-2xl font-bold bg-transparent border-b border-neon-purple-500/30 text-white focus:outline-none focus:border-cyber-cyan-400 pb-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedDraft.title}</h2>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`tag ${getStatusColor(selectedDraft.status)} border`}>
                      {getStatusText(selectedDraft.status)}
                    </span>
                    <span className="text-sm text-deep-indigo-400">
                      负责人：
                      {isEditing ? (
                        <input
                          value={displayData.owner}
                          onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                          className="bg-transparent border-b border-neon-purple-500/30 text-white ml-1 focus:outline-none w-28"
                        />
                      ) : (
                        <span className="text-deep-indigo-200">{selectedDraft.owner || '未指定'}</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {!isEditing && (
                    <>
                      {selectedDraft.status !== 'draft' && selectedDraft.status !== 'running' && selectedDraft.status !== 'completed' && (
                        <button
                          onClick={() => {
                            if (selectedDraft) handleStartEvaluate(selectedDraft);
                          }}
                          className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                        >
                          <Star className="w-4 h-4" />
                          {latestEval ? '重新评估' : '评估'}
                        </button>
                      )}
                      <button
                        onClick={handleStartEdit}
                        className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-4 h-4" />
                        编辑
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        取消
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editForm.title.trim()}
                        className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={displayData.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full input-field resize-none"
                  rows={3}
                  placeholder="活动描述"
                />
              ) : (
                <p className="text-deep-indigo-200 leading-relaxed">
                  {selectedDraft.description || '暂无描述'}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                  <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">活动时间</span>
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={displayData.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        className="input-field text-sm"
                      />
                      <input
                        type="date"
                        value={displayData.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium">
                      {selectedDraft.startDate && selectedDraft.endDate
                        ? `${formatDate(selectedDraft.startDate)} ~ ${formatDate(selectedDraft.endDate)}`
                        : '待定'}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                  <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">创建时间</span>
                  </div>
                  <p className="text-white font-medium">
                    {formatDate(selectedDraft.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyber-cyan-400" />
                    资源需求
                  </h4>
                  {isEditing && (
                    <button onClick={handleAddResource} className="btn-secondary text-sm py-1.5 px-3">
                      + 添加
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {displayData.resourceRequirements.length === 0 && !isEditing ? (
                    <p className="text-deep-indigo-500 text-sm">暂无资源需求</p>
                  ) : (
                    displayData.resourceRequirements.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10"
                      >
                        {isEditing ? (
                          <>
                            <input
                              value={res.type}
                              onChange={(e) => handleUpdateResource(res.id, 'type', e.target.value)}
                              placeholder="类型"
                              className="input-field flex-1 text-sm"
                            />
                            <input
                              value={res.description}
                              onChange={(e) => handleUpdateResource(res.id, 'description', e.target.value)}
                              placeholder="描述"
                              className="input-field flex-1 text-sm"
                            />
                            <input
                              type="number"
                              value={res.quantity}
                              onChange={(e) => handleUpdateResource(res.id, 'quantity', Number(e.target.value))}
                              className="input-field w-20 text-sm text-center"
                            />
                            <button
                              onClick={() => handleRemoveResource(res.id)}
                              className="p-2 rounded-lg hover:bg-rose-500/20 text-deep-indigo-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="text-white font-medium">{res.type}</p>
                              <p className="text-sm text-deep-indigo-400">{res.description}</p>
                            </div>
                            <span className="text-cyber-cyan-400 font-semibold">{res.quantity}</span>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    验证指标
                  </h4>
                  {isEditing && (
                    <button onClick={handleAddMetric} className="btn-secondary text-sm py-1.5 px-3">
                      + 添加
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {displayData.metrics.length === 0 && !isEditing ? (
                    <p className="text-deep-indigo-500 text-sm col-span-3">暂无验证指标</p>
                  ) : (
                    displayData.metrics.map((metric) => (
                      isEditing ? (
                        <div
                          key={metric.id}
                          className="p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10 space-y-2"
                        >
                          <input
                            value={metric.name}
                            onChange={(e) => handleUpdateMetric(metric.id, 'name', e.target.value)}
                            placeholder="指标名"
                            className="input-field text-sm"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={metric.target}
                              onChange={(e) => handleUpdateMetric(metric.id, 'target', Number(e.target.value))}
                              placeholder="目标值"
                              className="input-field flex-1 text-sm"
                            />
                            <input
                              value={metric.unit}
                              onChange={(e) => handleUpdateMetric(metric.id, 'unit', e.target.value)}
                              placeholder="单位"
                              className="input-field w-20 text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveMetric(metric.id)}
                            className="w-full py-1.5 text-xs rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                          >
                            删除
                          </button>
                        </div>
                      ) : (
                        <div
                          key={metric.id}
                          className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                        >
                          <p className="text-sm text-deep-indigo-400 mb-1">{metric.name}</p>
                          <p className="text-2xl font-bold text-white">
                            {metric.target}
                            <span className="text-sm font-normal text-deep-indigo-400 ml-1">{metric.unit}</span>
                          </p>
                        </div>
                      )
                    ))
                  )}
                </div>
              </div>

              {latestEval && (
                <div>
                  <div
                    className="flex items-center justify-between mb-3"
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowEvalHistory(!showEvalHistory)}
                    >
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        可行性评估
                        {evalHistory.length > 1 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-deep-indigo-700/50 text-deep-indigo-300">
                            共 {evalHistory.length} 次
                          </span>
                        )}
                      </h4>
                      {evalHistory.length > 1 && (
                        showEvalHistory ? <ChevronUp className="w-5 h-5 text-deep-indigo-400" /> : <ChevronDown className="w-5 h-5 text-deep-indigo-400" />
                      )}
                    </div>
                    {!isEditing && selectedDraft.status !== 'running' && selectedDraft.status !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedDraft) handleStartEvaluate(selectedDraft);
                        }}
                        className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        {latestEval ? '重新评估' : '评估'}
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className={`tag border ${getStatusColor(latestEval.decision === 'approved' ? 'approved' : latestEval.decision === 'rejected' ? 'rejected' : 'pending')}`}>
                          {latestEval.decision === 'approved' ? '通过' : latestEval.decision === 'rejected' ? '驳回' : '待定'}
                        </span>
                        <span className="text-xs text-deep-indigo-500 ml-2">
                          {latestEval.evaluator} · {formatDateTime(latestEval.evaluatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-deep-indigo-400 mb-1">风险</p>
                        <p className="text-xl font-bold text-rose-400">{latestEval.riskScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-deep-indigo-400 mb-1">资源</p>
                        <p className="text-xl font-bold text-amber-400">{latestEval.resourceScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-deep-indigo-400 mb-1">收益</p>
                        <p className="text-xl font-bold text-emerald-400">{latestEval.benefitScore}</p>
                      </div>
                    </div>
                    {latestEval.comment && (
                      <p className="text-sm text-deep-indigo-200 border-t border-neon-purple-500/10 pt-3">
                        {latestEval.comment}
                      </p>
                    )}
                  </div>

                  {showEvalHistory && evalHistory.length > 1 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-deep-indigo-500 px-1">历史评估记录：</p>
                      {evalHistory.slice(1).map((evalRec) => (
                        <div
                          key={evalRec.id}
                          className="p-3 rounded-xl bg-deep-indigo-900/40 border border-neon-purple-500/10 opacity-75"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`tag border text-xs ${getStatusColor(evalRec.decision === 'approved' ? 'approved' : evalRec.decision === 'rejected' ? 'rejected' : 'pending')}`}>
                              {evalRec.decision === 'approved' ? '通过' : evalRec.decision === 'rejected' ? '驳回' : '待定'}
                            </span>
                            <span className="text-xs text-deep-indigo-500">
                              {evalRec.evaluator} · {formatDateTime(evalRec.evaluatedAt)}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-deep-indigo-400 mb-1">
                            <span>风险 {evalRec.riskScore}</span>
                            <span>资源 {evalRec.resourceScore}</span>
                            <span>收益 {evalRec.benefitScore}</span>
                          </div>
                          {evalRec.comment && (
                            <p className="text-xs text-deep-indigo-400">{evalRec.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {getRelatedInspirations(selectedDraft).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">关联灵感</h4>
                  <div className="flex flex-wrap gap-2">
                    {getRelatedInspirations(selectedDraft).map((ins) => (
                      <div
                        key={ins.id}
                        className="px-3 py-2 rounded-xl bg-deep-indigo-800/60 border border-neon-purple-500/20"
                      >
                        <p className="text-sm text-white">{ins.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-neon-purple-500/20 flex-wrap">
                {nextAction?.show && !isEditing && (
                  <button
                    onClick={() => {
                      nextAction.action();
                      if (nextAction.isExternal) {
                        setShowDetailModal(false);
                      }
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <nextAction.icon className="w-4 h-4" />
                    {nextAction.label}
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="新建活动草案"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              活动名称 *
            </label>
            <input
              type="text"
              placeholder="输入活动名称"
              value={newDraft.title}
              onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              活动描述
            </label>
            <textarea
              placeholder="描述活动玩法和目标..."
              value={newDraft.description}
              onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                负责人
              </label>
              <input
                type="text"
                placeholder="负责人姓名"
                value={newDraft.owner}
                onChange={(e) => setNewDraft({ ...newDraft, owner: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                  开始日期
                </label>
                <input
                  type="date"
                  value={newDraft.startDate}
                  onChange={(e) => setNewDraft({ ...newDraft, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                  结束日期
                </label>
                <input
                  type="date"
                  value={newDraft.endDate}
                  onChange={(e) => setNewDraft({ ...newDraft, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleCreateDraft}
              disabled={!newDraft.title.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              创建草案
            </button>
          </div>
        </div>
      </Modal>

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
              <div className="flex items-center gap-3 text-sm flex-wrap">
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
                onClick={handleSubmitEvaluationFromDraft}
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
