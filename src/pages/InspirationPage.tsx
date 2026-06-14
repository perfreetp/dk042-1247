import { useState, useMemo } from 'react';
import { Plus, Search, TrendingUp, Clock, Filter } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import InspirationCard from '@/components/InspirationCard/InspirationCard';
import InspirationDetail from '@/components/InspirationDetail/InspirationDetail';
import Modal from '@/components/Modal/Modal';

const allTags = ['全部', '节日', '付费', '留存', '社交', '新手', '赛季', '召回'];

const sortOptions = [
  { value: 'latest', label: '最新发布', icon: Clock },
  { value: 'popular', label: '最受欢迎', icon: TrendingUp },
];

export default function InspirationPage() {
  const inspirations = useAppStore((state) => state.inspirations);
  const addInspiration = useAppStore((state) => state.addInspiration);
  
  const [selectedTag, setSelectedTag] = useState('全部');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInspirationId, setSelectedInspirationId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newInspiration, setNewInspiration] = useState({
    title: '',
    description: '',
    targetPlayer: '',
    rewardType: '',
    launchWindow: '',
    referenceActivity: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const filteredInspirations = useMemo(() => {
    let result = [...inspirations];
    
    if (selectedTag !== '全部') {
      result = result.filter((ins) =>
        ins.tags.some((tag) => tag.includes(selectedTag) || selectedTag.includes(tag))
      );
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ins) =>
          ins.title.toLowerCase().includes(query) ||
          ins.description.toLowerCase().includes(query)
      );
    }
    
    if (sortBy === 'popular') {
      result.sort((a, b) => b.likes - a.likes);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [inspirations, selectedTag, searchQuery, sortBy]);

  const handleAddTag = () => {
    if (tagInput.trim() && !newInspiration.tags.includes(tagInput.trim())) {
      setNewInspiration({
        ...newInspiration,
        tags: [...newInspiration.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewInspiration({
      ...newInspiration,
      tags: newInspiration.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = () => {
    if (!newInspiration.title.trim() || !newInspiration.description.trim()) return;
    
    addInspiration({
      title: newInspiration.title,
      description: newInspiration.description,
      targetPlayer: newInspiration.targetPlayer,
      rewardType: newInspiration.rewardType,
      launchWindow: newInspiration.launchWindow,
      referenceActivity: newInspiration.referenceActivity,
      tags: newInspiration.tags,
    });
    
    setNewInspiration({
      title: '',
      description: '',
      targetPlayer: '',
      rewardType: '',
      launchWindow: '',
      referenceActivity: '',
      tags: [],
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text mb-2">
            灵感广场
          </h1>
          <p className="text-deep-indigo-300">
            收集和分享游戏活动创意，让灵感不再流失
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          发布灵感
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-indigo-400" />
            <input
              type="text"
              placeholder="搜索灵感..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-deep-indigo-400" />
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-neon-purple-500/20 text-cyber-cyan-400 border border-neon-purple-500/30'
                      : 'text-deep-indigo-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neon-purple-500/10">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`tag cursor-pointer transition-all ${
                selectedTag === tag
                  ? 'bg-gradient-to-r from-neon-purple-500/30 to-cyber-cyan-500/30 text-white border border-neon-purple-500/50'
                  : 'tag-default hover:border-neon-purple-500/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInspirations.map((inspiration, index) => (
          <div
            key={inspiration.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="animate-slide-up"
          >
            <InspirationCard
              inspiration={inspiration}
              onClick={() => setSelectedInspirationId(inspiration.id)}
            />
          </div>
        ))}
      </div>

      {filteredInspirations.length === 0 && (
        <div className="text-center py-16">
          <p className="text-deep-indigo-400 text-lg">暂无相关灵感</p>
          <p className="text-deep-indigo-500 text-sm mt-2">
            换个标签试试，或者发布一个新灵感
          </p>
        </div>
      )}

      {selectedInspirationId && (
        <InspirationDetail
          inspirationId={selectedInspirationId}
          isOpen={!!selectedInspirationId}
          onClose={() => setSelectedInspirationId(null)}
        />
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="发布新灵感"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              灵感标题 *
            </label>
            <input
              type="text"
              placeholder="用一句话概括你的灵感"
              value={newInspiration.title}
              onChange={(e) =>
                setNewInspiration({ ...newInspiration, title: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              详细描述 *
            </label>
            <textarea
              placeholder="详细描述活动玩法、创意点..."
              value={newInspiration.description}
              onChange={(e) =>
                setNewInspiration({ ...newInspiration, description: e.target.value })
              }
              className="input-field resize-none"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                目标玩家
              </label>
              <input
                type="text"
                placeholder="如：中高付费玩家"
                value={newInspiration.targetPlayer}
                onChange={(e) =>
                  setNewInspiration({ ...newInspiration, targetPlayer: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                奖励形式
              </label>
              <input
                type="text"
                placeholder="如：虚拟货币 + 限定皮肤"
                value={newInspiration.rewardType}
                onChange={(e) =>
                  setNewInspiration({ ...newInspiration, rewardType: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                上线窗口
              </label>
              <input
                type="text"
                placeholder="如：春节假期"
                value={newInspiration.launchWindow}
                onChange={(e) =>
                  setNewInspiration({ ...newInspiration, launchWindow: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
                参考活动
              </label>
              <input
                type="text"
                placeholder="如：去年春节活动"
                value={newInspiration.referenceActivity}
                onChange={(e) =>
                  setNewInspiration({ ...newInspiration, referenceActivity: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="输入标签，按回车添加"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="input-field flex-1"
              />
              <button onClick={handleAddTag} className="btn-secondary">
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newInspiration.tags.map((tag) => (
                <span
                  key={tag}
                  className="tag tag-default cursor-pointer hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 transition-all"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} ×
                </span>
              ))}
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
              onClick={handleSubmit}
              disabled={!newInspiration.title.trim() || !newInspiration.description.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发布灵感
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
