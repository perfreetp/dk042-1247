import { useState } from 'react';
import { Heart, MessageCircle, AlertTriangle, Users, Gift, Calendar, ExternalLink, Send, Plus, X } from 'lucide-react';
import type { Inspiration, Risk } from '@/types';
import { getTagColorClass, formatDateTime, getRiskColor, getRiskText } from '@/utils/helpers';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';

interface InspirationDetailProps {
  inspirationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InspirationDetail({ inspirationId, isOpen, onClose }: InspirationDetailProps) {
  const [commentText, setCommentText] = useState('');
  const [riskText, setRiskText] = useState('');
  const [riskLevel, setRiskLevel] = useState<Risk['level']>('medium');
  const [showRiskInput, setShowRiskInput] = useState(false);
  const [showCreateDraft, setShowCreateDraft] = useState(false);
  
  const inspiration = useAppStore((state) => state.getInspirationById(inspirationId));
  const toggleLike = useAppStore((state) => state.toggleLike);
  const addComment = useAppStore((state) => state.addComment);
  const addRisk = useAppStore((state) => state.addRisk);
  const createDraftFromInspiration = useAppStore((state) => state.createDraftFromInspiration);
  const currentUser = useAppStore((state) => state.currentUser);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment(inspirationId, commentText.trim());
    setCommentText('');
  };

  const handleSubmitRisk = () => {
    if (!riskText.trim()) return;
    addRisk(inspirationId, riskText.trim(), riskLevel);
    setRiskText('');
    setShowRiskInput(false);
  };

  const handleCreateDraft = () => {
    createDraftFromInspiration(inspirationId, {});
    setShowCreateDraft(false);
    onClose();
  };

  if (!inspiration) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="灵感详情" size="lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">{inspiration.title}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {inspiration.tags.map((tag) => (
              <span key={tag} className={`tag ${getTagColorClass(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
          <p className="text-deep-indigo-200 leading-relaxed">{inspiration.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
            <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">目标玩家</span>
            </div>
            <p className="text-white font-medium">{inspiration.targetPlayer}</p>
          </div>
          <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
            <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
              <Gift className="w-4 h-4" />
              <span className="text-sm">奖励形式</span>
            </div>
            <p className="text-white font-medium">{inspiration.rewardType}</p>
          </div>
          <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
            <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">上线窗口</span>
            </div>
            <p className="text-white font-medium">{inspiration.launchWindow}</p>
          </div>
          <div className="p-4 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10">
            <div className="flex items-center gap-2 text-deep-indigo-400 mb-2">
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">参考活动</span>
            </div>
            <p className="text-white font-medium">{inspiration.referenceActivity}</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-neon-purple-500/20">
          <div className="flex items-center gap-6">
            <button
              onClick={() => toggleLike(inspiration.id)}
              className={`flex items-center gap-2 transition-all ${
                inspiration.isLiked
                  ? 'text-rose-400'
                  : 'text-deep-indigo-300 hover:text-rose-400'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${inspiration.isLiked ? 'fill-current' : ''}`}
              />
              <span className="font-medium">{inspiration.likes} 赞</span>
            </button>
            <div className="flex items-center gap-2 text-deep-indigo-300">
              <MessageCircle className="w-5 h-5" />
              <span>{inspiration.comments.length} 评论</span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateDraft(true)}
            className="btn-primary text-sm"
          >
            生成活动草案
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              风险点 ({inspiration.risks.length})
            </h3>
            <button
              onClick={() => setShowRiskInput(!showRiskInput)}
              className="text-sm text-cyber-cyan-400 hover:text-cyber-cyan-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              补充风险
            </button>
          </div>

          {showRiskInput && (
            <div className="mb-4 p-4 rounded-xl bg-deep-indigo-800/60 border border-neon-purple-500/20">
              <textarea
                value={riskText}
                onChange={(e) => setRiskText(e.target.value)}
                placeholder="描述风险点..."
                className="input-field mb-3 resize-none"
                rows={2}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-deep-indigo-400">风险等级：</span>
                  {(['low', 'medium', 'high'] as Risk['level'][]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setRiskLevel(level)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        riskLevel === level
                          ? getRiskColor(level)
                          : 'text-deep-indigo-400 border-deep-indigo-600 hover:border-deep-indigo-500'
                      }`}
                    >
                      {getRiskText(level)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRiskInput(false)}
                    className="text-sm text-deep-indigo-400 hover:text-white"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitRisk}
                    className="btn-primary text-sm py-1.5 px-4"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          )}

          {inspiration.risks.length === 0 ? (
            <p className="text-deep-indigo-500 text-sm text-center py-4">
              暂无风险点，点击上方按钮补充
            </p>
          ) : (
            <div className="space-y-2">
              {inspiration.risks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-3 rounded-xl bg-deep-indigo-800/40 border border-neon-purple-500/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-deep-indigo-200 text-sm">{risk.content}</p>
                    <span className={`tag ${getRiskColor(risk.level)} flex-shrink-0`}>
                      {getRiskText(risk.level)}
                    </span>
                  </div>
                  <p className="text-xs text-deep-indigo-500 mt-2">
                    {risk.author}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyber-cyan-400" />
            评论 ({inspiration.comments.length})
          </h3>

          <div className="flex gap-3 mb-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="发表你的看法..."
                className="input-field resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  发送
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {inspiration.comments.length === 0 ? (
              <p className="text-deep-indigo-500 text-sm text-center py-4">
                暂无评论，来说说你的想法吧
              </p>
            ) : (
              inspiration.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple-500 to-cyber-cyan-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {comment.author}
                      </span>
                      <span className="text-xs text-deep-indigo-500">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-deep-indigo-300 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-neon-purple-500/20">
          <p className="text-xs text-deep-indigo-500">
            由 {inspiration.author} 发布于 {formatDateTime(inspiration.createdAt)}
          </p>
        </div>
      </div>

      <Modal isOpen={showCreateDraft} onClose={() => setShowCreateDraft(false)} title="生成活动草案" size="sm">
        <div className="space-y-4">
          <p className="text-deep-indigo-300">
            确定要将「{inspiration.title}」生成为活动草案吗？
          </p>
          <p className="text-sm text-deep-indigo-500">
            生成后可以在「活动草案」页面完善详细信息。
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowCreateDraft(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleCreateDraft} className="btn-primary">
              确认生成
            </button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
