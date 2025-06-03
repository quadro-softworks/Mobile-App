import { create } from 'zustand';
import { feedbackApi } from '@/services/mockApi';
import { Feedback } from '@/types';

interface FeedbackStore {
  feedback: Feedback[];
  isLoading: boolean;
  error: string | null;
  
  fetchFeedback: () => Promise<void>;
  submitFeedback: (feedbackData: Partial<Feedback>) => Promise<void>;
  clearError: () => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  feedback: [],
  isLoading: false,
  error: null,
  
  fetchFeedback: async () => {
    set({ isLoading: true, error: null });
    try {
      const feedback = await feedbackApi.getFeedback();
      set({ feedback, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  submitFeedback: async (feedbackData) => {
    set({ isLoading: true, error: null });
    try {
      const newFeedback = await feedbackApi.submitFeedback(feedbackData);
      set((state) => ({
        feedback: [...state.feedback, newFeedback],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));