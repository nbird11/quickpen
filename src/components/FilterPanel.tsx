import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge, Button, Form } from 'react-bootstrap';
import { Sprint } from '../types/sprint';
import { AppliedFilters } from '../types/filters';

interface FilterPanelProps {
  allSprints: Sprint[];
  currentAppliedFilters: AppliedFilters;
  onFiltersChange: (filters: AppliedFilters) => void;
  isTagFilterEnabled: boolean;
  onSetIsTagFilterEnabled: (enabled: boolean) => void;
  isDateFilterEnabled: boolean;
  onSetIsDateFilterEnabled: (enabled: boolean) => void;
  isContentFilterEnabled: boolean;
  onSetIsContentFilterEnabled: (enabled: boolean) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  allSprints,
  currentAppliedFilters,
  onFiltersChange,
  isTagFilterEnabled,
  onSetIsTagFilterEnabled,
  isDateFilterEnabled,
  onSetIsDateFilterEnabled,
  isContentFilterEnabled,
  onSetIsContentFilterEnabled,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(currentAppliedFilters.tags);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string | null>(currentAppliedFilters.dateRange?.startDate || null);
  const [endDate, setEndDate] = useState<string | null>(currentAppliedFilters.dateRange?.endDate || null);
  const [localContentQuery, setLocalContentQuery] = useState<string | null>(currentAppliedFilters.contentQuery || null);

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

  // Effect to synchronize local state with incoming props if they change from parent
  useEffect(() => {
    setSelectedTags(currentAppliedFilters.tags);
    setStartDate(currentAppliedFilters.dateRange?.startDate || null);
    setEndDate(currentAppliedFilters.dateRange?.endDate || null);
    setLocalContentQuery(currentAppliedFilters.contentQuery || null);
  }, [currentAppliedFilters]);

  // Effect to notify parent component of filter changes
  useEffect(() => {
    const filtersToApply: AppliedFilters = { 
      tags: isTagFilterEnabled ? selectedTags : [], 
      dateRange: {
        startDate: isDateFilterEnabled ? startDate : null,
        endDate: isDateFilterEnabled ? endDate : null,
      },
      contentQuery: isContentFilterEnabled ? (localContentQuery || '').trim() : null,
    };
    onFiltersChange(filtersToApply);
  }, [selectedTags, startDate, endDate, localContentQuery, isTagFilterEnabled, isDateFilterEnabled, isContentFilterEnabled, onFiltersChange]);

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
      {/* Section to select active filter types */}
      <div className="mb-3">
        <h6>Active Filters</h6>
        <Form.Check 
          type="switch" 
          id="tags-filter-switch" 
          label="Tags" 
          checked={isTagFilterEnabled} 
          onChange={() => {
            const newActiveState = !isTagFilterEnabled;
            onSetIsTagFilterEnabled(newActiveState);
            if (!newActiveState) {
              setSelectedTags([]);
              setTagSearchQuery('');
            }
          }} 
        />
        <Form.Check 
          type="switch" 
          id="date-range-filter-switch" 
          label="Date Range" 
          checked={isDateFilterEnabled} 
          onChange={() => {
            const newActiveState = !isDateFilterEnabled;
            onSetIsDateFilterEnabled(newActiveState);
            if (!newActiveState) {
              setStartDate(null);
              setEndDate(null);
            }
          }} 
        />
        <Form.Check 
          type="switch" 
          id="content-filter-switch"
          label="Content Search" 
          checked={isContentFilterEnabled} 
          onChange={() => {
            const newActiveState = !isContentFilterEnabled;
            onSetIsContentFilterEnabled(newActiveState);
            if (!newActiveState) {
              setLocalContentQuery('');
            }
          }} 
        />
      </div>

      {isTagFilterEnabled && (
        <>
          <hr />
          {/* Tag Filtering Section */}
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
        </>
      )}

      {isDateFilterEnabled && (
        <>
          <hr />
          {/* Date Range Filtering Section */}
          <h5>Filter by Date Range</h5>
          <Form.Group className="mb-2">
            <Form.Label size="sm">Start Date</Form.Label>
            <Form.Control 
              type="date" 
              size="sm" 
              value={startDate || ''} 
              onChange={(e) => setStartDate(e.target.value || null)} 
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label size="sm">End Date</Form.Label>
            <Form.Control 
              type="date" 
              size="sm" 
              value={endDate || ''} 
              onChange={(e) => setEndDate(e.target.value || null)} 
              min={startDate || undefined}
            />
          </Form.Group>
          {(startDate || endDate) && (
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
            >
              Clear Dates
            </Button>
          )}
        </>
      )}

      {isContentFilterEnabled && (
        <>
          <hr />
          <h5>Filter by Content</h5>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Search in sprint content..."
              value={localContentQuery || ''}
              onChange={(e) => setLocalContentQuery(e.target.value)}
              size="sm"
            />
          </Form.Group>
          {(localContentQuery && localContentQuery.trim() !== '') && (
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => setLocalContentQuery('')}
            >
              Clear Content Search
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default FilterPanel;