import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Inspiration,
  Material,
  Draft,
  Evaluation,
  Review,
  User,
  Comment,
  Risk,
} from '@/types';
import {
  mockInspirations,
  mockMaterials,
  mockDrafts,
  mockEvaluations,
  mockReviews,
  currentUser as mockCurrentUser,
} from '@/data/mockData';

interface AppState {
  currentUser: User;
  inspirations: Inspiration[];
  materials: Material[];
  drafts: Draft[];
  evaluations: Evaluation[];
  reviews: Review[];
  
  toggleLike: (inspirationId: string) => void;
  addComment: (inspirationId: string, content: string) => void;
  addRisk: (inspirationId: string, content: string, level: Risk['level']) => void;
  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'likes' | 'createdAt' | 'isLiked' | 'comments' | 'risks' | 'author'>) => void;
  
  addMaterial: (material: Omit<Material, 'id' | 'uploadedAt'>) => void;
  
  createDraft: (draft: Omit<Draft, 'id' | 'createdAt' | 'status'> & Partial<Pick<Draft, 'status'>>) => Draft;
  createDraftFromInspiration: (inspirationId: string, draftData: Partial<Draft>) => void;
  updateDraft: (draftId: string, updates: Partial<Omit<Draft, 'id' | 'createdAt'>>) => void;
  updateDraftStatus: (draftId: string, status: Draft['status']) => void;
  
  submitEvaluation: (draftId: string, evaluation: Omit<Evaluation, 'id' | 'draftId' | 'evaluatedAt' | 'evaluator'>) => void;
  
  submitReview: (draftId: string, review: Omit<Review, 'id' | 'draftId' | 'completedAt'>) => void;
  updateReview: (reviewId: string, updates: Partial<Omit<Review, 'id' | 'draftId'>>) => void;
  
  getInspirationById: (id: string) => Inspiration | undefined;
  getDraftById: (id: string) => Draft | undefined;
  getEvaluationByDraftId: (draftId: string) => Evaluation | undefined;
  getEvaluationsByDraftId: (draftId: string) => Evaluation[];
  getReviewByDraftId: (draftId: string) => Review | undefined;
}

const generateId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: mockCurrentUser,
      inspirations: mockInspirations,
      materials: mockMaterials,
      drafts: mockDrafts,
      evaluations: mockEvaluations,
      reviews: mockReviews,

      toggleLike: (inspirationId) => {
        set((state) => ({
          inspirations: state.inspirations.map((ins) =>
            ins.id === inspirationId
              ? {
                  ...ins,
                  isLiked: !ins.isLiked,
                  likes: ins.isLiked ? ins.likes - 1 : ins.likes + 1,
                }
              : ins
          ),
        }));
      },

      addComment: (inspirationId, content) => {
        const { currentUser } = get();
        const newComment: Comment = {
          id: generateId('c'),
          content,
          author: currentUser.name,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          inspirations: state.inspirations.map((ins) =>
            ins.id === inspirationId
              ? { ...ins, comments: [...ins.comments, newComment] }
              : ins
          ),
        }));
      },

      addRisk: (inspirationId, content, level) => {
        const { currentUser } = get();
        const newRisk: Risk = {
          id: generateId('r'),
          content,
          level,
          author: currentUser.name,
        };
        set((state) => ({
          inspirations: state.inspirations.map((ins) =>
            ins.id === inspirationId
              ? { ...ins, risks: [...ins.risks, newRisk] }
              : ins
          ),
        }));
      },

      addInspiration: (inspiration) => {
        const { currentUser } = get();
        const newInspiration: Inspiration = {
          ...inspiration,
          id: generateId('ins'),
          likes: 0,
          createdAt: new Date().toISOString(),
          isLiked: false,
          comments: [],
          risks: [],
          author: currentUser.name,
        };
        set((state) => ({
          inspirations: [newInspiration, ...state.inspirations],
        }));
      },

      addMaterial: (material) => {
        const newMaterial: Material = {
          ...material,
          id: generateId('mat'),
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({
          materials: [newMaterial, ...state.materials],
        }));
      },

      createDraft: (draft) => {
        const newDraft: Draft = {
          ...draft,
          id: generateId('draft'),
          status: draft.status || 'draft',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          drafts: [newDraft, ...state.drafts],
        }));
        return newDraft;
      },

      createDraftFromInspiration: (inspirationId, draftData) => {
        const inspiration = get().inspirations.find((i) => i.id === inspirationId);
        if (!inspiration) return;

        const newDraft: Draft = {
          id: generateId('draft'),
          title: draftData.title || inspiration.title,
          description: draftData.description || inspiration.description,
          status: 'draft',
          resourceRequirements: draftData.resourceRequirements || [],
          metrics: draftData.metrics || [],
          owner: draftData.owner || get().currentUser.name,
          startDate: draftData.startDate || '',
          endDate: draftData.endDate || '',
          relatedInspirationIds: [inspirationId],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          drafts: [newDraft, ...state.drafts],
        }));
      },

      updateDraftStatus: (draftId, status) => {
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === draftId ? { ...d, status } : d
          ),
        }));
      },

      updateDraft: (draftId, updates) => {
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === draftId ? { ...d, ...updates } : d
          ),
        }));
      },

      submitEvaluation: (draftId, evaluation) => {
        const { currentUser } = get();
        const newEvaluation: Evaluation = {
          ...evaluation,
          id: generateId('eval'),
          draftId,
          evaluator: currentUser.name,
          evaluatedAt: new Date().toISOString(),
        };
        set((state) => ({
          evaluations: [...state.evaluations, newEvaluation],
          drafts: state.drafts.map((d) =>
            d.id === draftId
              ? { ...d, status: evaluation.decision === 'approved' ? 'approved' : 'rejected' }
              : d
          ),
        }));
      },

      submitReview: (draftId, review) => {
        const existingReview = get().reviews.find((r) => r.draftId === draftId);
        if (existingReview) {
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === existingReview.id
                ? { ...r, ...review, completedAt: new Date().toISOString() }
                : r
            ),
          }));
        } else {
          const newReview: Review = {
            ...review,
            id: generateId('review'),
            draftId,
            completedAt: new Date().toISOString(),
          };
          set((state) => ({
            reviews: [...state.reviews, newReview],
          }));
        }
      },

      updateReview: (reviewId, updates) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId ? { ...r, ...updates, completedAt: new Date().toISOString() } : r
          ),
        }));
      },

      getInspirationById: (id) => {
        return get().inspirations.find((i) => i.id === id);
      },

      getDraftById: (id) => {
        return get().drafts.find((d) => d.id === id);
      },

      getEvaluationByDraftId: (draftId) => {
        const allEvals = get().evaluations.filter((e) => e.draftId === draftId);
        if (allEvals.length === 0) return undefined;
        return allEvals.sort(
          (a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
        )[0];
      },

      getEvaluationsByDraftId: (draftId) => {
        return get()
          .evaluations.filter((e) => e.draftId === draftId)
          .sort(
            (a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
          );
      },

      getReviewByDraftId: (draftId) => {
        return get().reviews.find((r) => r.draftId === draftId);
      },
    }),
    {
      name: 'idea-lab-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inspirations: state.inspirations,
        materials: state.materials,
        drafts: state.drafts,
        evaluations: state.evaluations,
        reviews: state.reviews,
      }),
    }
  )
);
