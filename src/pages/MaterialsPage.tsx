import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, Image, Eye, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Modal from '@/components/Modal/Modal';
import { getMaterialTypeText, getMaterialTypeColor, formatDate } from '@/utils/helpers';
import type { Material, MaterialType } from '@/types';

const typeFilters: { value: MaterialType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'poster', label: '海报' },
  { value: 'competitor', label: '竞品' },
  { value: 'sketch', label: '草图' },
  { value: 'other', label: '其他' },
];

export default function MaterialsPage() {
  const materials = useAppStore((state) => state.materials);
  const addMaterial = useAppStore((state) => state.addMaterial);
  
  const [selectedType, setSelectedType] = useState<MaterialType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'other' as MaterialType,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!showUploadModal) {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  }, [showUploadModal]);

  const filteredMaterials = useMemo(() => {
    let result = [...materials];
    
    if (selectedType !== 'all') {
      result = result.filter((m) => m.type === selectedType);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [materials, selectedType, searchQuery]);

  const handleAddTag = () => {
    if (tagInput.trim() && !newMaterial.tags.includes(tagInput.trim())) {
      setNewMaterial({
        ...newMaterial,
        tags: [...newMaterial.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewMaterial({
      ...newMaterial,
      tags: newMaterial.tags.filter((t) => t !== tag),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      if (!newMaterial.title.trim()) {
        setNewMaterial({ ...newMaterial, title: file.name.replace(/\.[^/.]+$/, '') });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      if (!newMaterial.title.trim()) {
        setNewMaterial({ ...newMaterial, title: file.name.replace(/\.[^/.]+$/, '') });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = () => {
    if (!newMaterial.title.trim() || !previewUrl) return;
    
    addMaterial({
      title: newMaterial.title,
      type: newMaterial.type,
      tags: newMaterial.tags,
      url: previewUrl,
    });
    
    setNewMaterial({
      title: '',
      type: 'other',
      tags: [],
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text mb-2">
            素材库
          </h1>
          <p className="text-deep-indigo-300">
            管理海报草图、竞品截图等参考素材
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          上传素材
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-indigo-400" />
            <input
              type="text"
              placeholder="搜索素材..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedType(filter.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedType === filter.value
                    ? 'bg-gradient-to-r from-neon-purple-500/30 to-cyber-cyan-500/30 text-white border border-neon-purple-500/50'
                    : 'text-deep-indigo-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMaterials.map((material, index) => (
          <div
            key={material.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="animate-slide-up"
          >
            <div
              onClick={() => setSelectedMaterial(material)}
              className="glass-card glass-card-hover cursor-pointer overflow-hidden group"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={material.url}
                  alt={material.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-indigo-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMaterialTypeColor(material.type)}`}>
                      {getMaterialTypeText(material.type)}
                    </span>
                    <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 truncate">
                  {material.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {material.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-deep-indigo-700/50 text-deep-indigo-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-deep-indigo-500">
                  {formatDate(material.uploadedAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-16">
          <Image className="w-16 h-16 text-deep-indigo-600 mx-auto mb-4" />
          <p className="text-deep-indigo-400 text-lg">暂无相关素材</p>
          <p className="text-deep-indigo-500 text-sm mt-2">
            上传一些海报草图或竞品截图吧
          </p>
        </div>
      )}

      <Modal
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        title={selectedMaterial?.title || ''}
        size="xl"
      >
        {selectedMaterial && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-deep-indigo-900">
              <img
                src={selectedMaterial.url}
                alt={selectedMaterial.title}
                className="w-full max-h-[60vh] object-contain"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`tag ${getMaterialTypeColor(selectedMaterial.type)}`}>
                  {getMaterialTypeText(selectedMaterial.type)}
                </span>
                <span className="text-sm text-deep-indigo-400">
                  {formatDate(selectedMaterial.uploadedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary flex items-center gap-2 text-sm py-2">
                  <Download className="w-4 h-4" />
                  下载
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-deep-indigo-400 mb-2">标签</p>
              <div className="flex flex-wrap gap-2">
                {selectedMaterial.tags.map((tag) => (
                  <span key={tag} className="tag tag-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="上传素材"
        size="md"
      >
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {previewUrl ? (
            <div
              className="border-2 border-dashed border-cyber-cyan-500/50 rounded-xl p-4 text-center hover:border-cyber-cyan-500/70 transition-colors cursor-pointer bg-deep-indigo-900/30"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img
                src={previewUrl}
                alt="预览"
                className="max-h-48 mx-auto rounded-lg object-contain mb-3"
              />
              <p className="text-cyber-cyan-400 text-sm mb-1">
                {selectedFile?.name || '已选择图片'}
              </p>
              <p className="text-xs text-deep-indigo-500">点击或拖拽更换图片</p>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-neon-purple-500/30 rounded-xl p-8 text-center hover:border-neon-purple-500/50 transition-colors cursor-pointer bg-deep-indigo-900/30"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Image className="w-12 h-12 text-deep-indigo-400 mx-auto mb-3" />
              <p className="text-deep-indigo-300 mb-1">点击或拖拽图片到这里上传</p>
              <p className="text-xs text-deep-indigo-500">支持 JPG、PNG、WEBP 格式</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              素材标题 *
            </label>
            <input
              type="text"
              placeholder="给素材起个名字"
              value={newMaterial.title}
              onChange={(e) =>
                setNewMaterial({ ...newMaterial, title: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-deep-indigo-200 mb-2">
              素材类型
            </label>
            <div className="flex flex-wrap gap-2">
              {(['poster', 'competitor', 'sketch', 'other'] as MaterialType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setNewMaterial({ ...newMaterial, type })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    newMaterial.type === type
                      ? 'bg-neon-purple-500/20 text-cyber-cyan-400 border border-neon-purple-500/30'
                      : 'text-deep-indigo-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {getMaterialTypeText(type)}
                </button>
              ))}
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
              {newMaterial.tags.map((tag) => (
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
              onClick={() => setShowUploadModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={!newMaterial.title.trim() || !previewUrl}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上传
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
