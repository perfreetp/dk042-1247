import { Heart, MessageCircle, AlertTriangle, Users, Gift, Calendar, ExternalLink } from 'lucide-react';
import type { Inspiration } from '@/types';
import { getTagColorClass, formatDate } from '@/utils/helpers';
import { useAppStore } from '@/store/useAppStore';

interface InspirationCardProps {
  inspiration: Inspiration;
  onClick?: () => void;
}

export default function InspirationCard({ inspiration, onClick }: InspirationCardProps) {
  const toggleLike = useAppStore((state) => state.toggleLike);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(inspiration.id);
  };

  return (
    <div
      onClick={onClick}
      className="glass-card glass-card-hover cursor-pointer overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple-500/0 via-cyber-cyan-400/50 to-neon-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-cyber-cyan-400 transition-colors line-clamp-2">
            {inspiration.title}
          </h3>
        </div>

        <p className="text-deep-indigo-300 text-sm mb-4 line-clamp-2">
          {inspiration.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {inspiration.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`tag ${getTagColorClass(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2 text-sm text-deep-indigo-400 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{inspiration.targetPlayer}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span>{inspiration.rewardType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{inspiration.launchWindow}</span>
          </div>
        </div>

        {inspiration.risks.length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="text-xs text-rose-400">
              {inspiration.risks.length} 个风险点
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neon-purple-500/10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-all ${
                inspiration.isLiked
                  ? 'text-rose-400'
                  : 'text-deep-indigo-400 hover:text-rose-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${inspiration.isLiked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{inspiration.likes}</span>
            </button>
            <div className="flex items-center gap-1.5 text-deep-indigo-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{inspiration.comments.length}</span>
            </div>
          </div>
          <div className="text-xs text-deep-indigo-500">
            {formatDate(inspiration.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
