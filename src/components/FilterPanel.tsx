import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { Sprint } from '../types/sprint';
import { AppliedFilters } from '../types/filters';

interface FilterPanelProps {
  allSprints: Sprint[];
  onFiltersChange: (filters: AppliedFilters) => void;
  // We can add a prop for initialAppliedFilters if needed later
}

const FilterPanel: React.FC<FilterPanelProps> = ({ allSprints, onFiltersChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allSprints.forEach(sprint => {
      sprint.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [allSprints]);

  const displayedTags = useMemo(() => {
    if (!tagSearchQuery) {
      return allUniqueTags;
    }
    return allUniqueTags.filter(tag =>
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [allUniqueTags, tagSearchQuery]);

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
    setTagSearchQuery('');
  }, []);

  return (
    <>
      <h5>Filter by Tags</h5>
      <Form.Group className="mb-2">
        <Form.Control
          type="text"
          placeholder="Search tags..."
          value={tagSearchQuery}
          onChange={(e) => setTagSearchQuery(e.target.value)}
          size="sm"
        />
      </Form.Group>

      {
        allUniqueTags.length > 0 ? (
          <div
            className="mb-2"
            style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid #dee2e6',
              padding: '0.5rem'
            }}
            // TODO: Investigate if the height of this scrollable tag area can be made
            // to adjust more immediately as tagSearchQuery changes, rather than primarily
            // after a tag selection/deselection. Current behavior is acceptable but could be smoother.
          >
            {displayedTags.length > 0 ? displayedTags.map(tag => (
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
            )) : (
              <p className="text-muted small m-0">No tags match your search.</p>
            )}
          </div>
        ) : (
          <p className="text-muted small">No tags available for filtering.</p>
        )
      }
      {
        selectedTags.length > 0 && (
          <Button variant="outline-secondary" size="sm" onClick={handleClearTagFilters}>
            Clear Tag Filters & Search
          </Button>
        )
      }
      {/* Placeholder for future filter types like date range */}
      {/* <hr /> */}
      {/* <h5>Filter by Date Range</h5> */}
      {/* ... date range filter UI ... */}
    </>
  );
};

export default FilterPanel;