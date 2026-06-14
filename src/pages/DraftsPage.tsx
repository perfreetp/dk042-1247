import { useState } from 'react';
import { Plus, Calendar, User, Target, Package, Clock, ChevronRight, Send } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';
import { getStatusColor, getStatusText, formatDate } from '@/utils/helpers';
import type { Draft, DraftStatus, ResourceRequirement, Metric } from '@/types';

const statusFilters: { value: DraftStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待评估' },
  { value: 'approved', label: '已通过' },
  { value: 'running', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

export default function DraftsPage() {
  const drafts = useAppStore((state) => state.drafts);
  const inspirations = useAppStore((state) => state.inspirations);
  const updateDraftStatus = useAppStore((state) => state.updateDraftStatus);
  const createDraft = useAppStore((state) => state.createDraft);
  const getDraftById = useAppStore((state) => state.getDraftById);
  
  const [selectedStatus, setSelectedStatus] = useState<DraftStatus | 'all'>('all');
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
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
  };

  const handleSubmitForEvaluation = (draftId: string) => {
    updateDraftStatus(draftId, 'pending');
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
    
    setNewDraft({
      title: '',
      description: '',
      owner: '',
      startDate: '',
      endDate: '',
    });
    setShowCreateModal(false);
    
    if (createdDraft) {
      setSelectedDraftId(createdDraft.id);
      setShowDetailModal(true);
    }
  };

  const getRelatedInspirations = (draft: Draft) => {
    return inspirations.filter((ins) => draft.relatedInspirationIds.includes(ins.id));
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
        {filteredDrafts.map((draft, index) => (
          <div
            key={draft.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="glass-card glass-card-hover cursor-pointer animate-slide-up overflow-hidden"
            onClick={() => handleViewDetail(draft)}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyber-cyan-400 transition-colors">
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
                <ChevronRight className="w-5 h-5 text-deep-indigo-500 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-deep-indigo-400" />
                  <span className="text-deep-indigo-300">{draft.owner}</span>
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
                <div className="pt-4 border-t border-neon-purple-500/10">
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
        ))}
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
        }}
        title={selectedDraft?.title || ''}
        size="xl"
      >
        {selectedDraft && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={`tag ${getStatusColor(selectedDraft.status)} border`}>
                {getStatusText(selectedDraft.status)}
              </span>
              <span className="text-sm text-deep-indigo-500">
                负责人：{selectedDraft.owner}
              </span>
            </div>

            <p className="text-deep-indigo-200 leading-relaxed">
              {selectedDraft.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
                <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">活动时间</span>
                </div>
                <p className="text-white font-medium">
                  {selectedDraft.startDate && selectedDraft.endDate
                    ? `${formatDate(selectedDraft.startDate)} ~ ${formatDate(selectedDraft.endDate)}`
                    : '待定'}
                </p>
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
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-cyber-cyan-400" />
                资源需求
              </h4>
              <div className="space-y-2">
                {selectedDraft.resourceRequirements.length === 0 ? (
                  <p className="text-deep-indigo-500 text-sm">暂无资源需求</p>
                ) : (
                  selectedDraft.resourceRequirements.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10"
                    >
                      <div>
                        <p className="text-white font-medium">{res.type}</p>
                        <p className="text-sm text-deep-indigo-400">{res.description}</p>
                      </div>
                      <span className="text-cyber-cyan-400 font-semibold">
                        {res.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                验证指标
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedDraft.metrics.length === 0 ? (
                  <p className="text-deep-indigo-500 text-sm">暂无验证指标</p>
                ) : (
                  selectedDraft.metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                    >
                      <p className="text-sm text-deep-indigo-400 mb-1">{metric.name}</p>
                      <p className="text-2xl font-bold text-white">
                        {metric.target}
                        <span className="text-sm font-normal text-deep-indigo-400 ml-1">
                          {metric.unit}
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

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

            <div className="flex justify-end gap-3 pt-4 border-t border-neon-purple-500/20">
              {selectedDraft.status === 'draft' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmitForEvaluation(selectedDraft.id);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  提交评估
                </button>
              )}
            </div>
          </div>
        )}
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
    </div>
  );
}
