export interface AppliedFilters {
  tags: string[];
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  // Future filter types like date ranges can be added here
  // dateRange?: { startDate?: Date; endDate?: Date };
} 