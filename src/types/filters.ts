export interface AppliedFilters {
  tags: string[];
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  contentQuery?: string | null;
} 