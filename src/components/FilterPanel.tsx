import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { Sprint } from '../types/sprint';
import { AppliedFilters } from '../types/filters';

interface FilterPanelProps {
  allSprints: Sprint[];
  onFiltersChange: (filters: AppliedFilters) => void;
  // We can add a prop for initialAppliedFilters if needed later
}

const FilterPanel: React.FC<FilterPanelProps> = ({ allSprints, onFiltersChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // TODO: Implement tag search functionality if the list of tags becomes too long.
  // const [tagSearchQuery, setTagSearchQuery] = useState('');

  const uniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allSprints.forEach(sprint => {
      sprint.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [allSprints]);

  // Effect to notify parent component of filter changes
  useEffect(() => {
    onFiltersChange({ tags: selectedTags });
  }, [selectedTags, onFiltersChange]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTagFilters = useCallback(() => {
    setSelectedTags([]);
  }, []);

  return (
    <div className="mb-3">
      <h5>Filter by Tags</h5>
      {uniqueTags.length > 0 ? (
        <div className="mb-2">
          {uniqueTags.map(tag => (
            <Badge
              key={tag}
              pill
              bg={selectedTags.includes(tag) ? 'primary' : 'secondary'}
              onClick={() => handleToggleTag(tag)}
              className="me-1 mb-1"
              style={{ cursor: 'pointer' }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted small">No tags available for filtering.</p>
      )}
      {selectedTags.length > 0 && (
        <Button variant="outline-secondary" size="sm" onClick={handleClearTagFilters}>
          Clear Tag Filters
        </Button>
      )}
      {/* Placeholder for future filter types like date range */}
      {/* <hr /> */}
      {/* <h5>Filter by Date Range</h5> */}
      {/* ... date range filter UI ... */}
    </div>
  );
};

export default FilterPanel; 