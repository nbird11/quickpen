import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { historyService } from '../services/history';
import { Sprint } from '../types/sprint';
import { AppliedFilters } from '../types/filters';
import FilterPanel from './FilterPanel';
import ExportPanel from './ExportPanel';
import SprintPDFDocument from './SprintPDFDocument';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { eventService, EVENTS } from '../services/events';
import { formatDuration } from '../utils/formatters';

const SprintHistoryContainer: React.FC = () => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({ tags: [], dateRange: { startDate: null, endDate: null }, contentQuery: null });
  const contentViewerRef = useRef<HTMLTextAreaElement>(null);
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);
  const [isTagFilterEnabled, setIsTagFilterEnabled] = useState(false);
  const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(false);
  const [isContentFilterEnabled, setIsContentFilterEnabled] = useState(false);

  // State for export functionality
  const [isExportSelectionModeActive, setIsExportSelectionModeActive] = useState(false);
  const [selectedSprintIdsForExport, setSelectedSprintIdsForExport] = useState<string[]>([]);

  // Refs for height calculation
  const headerRef = useRef<HTMLDivElement>(null);
  const exportPanelWrapperRef = useRef<HTMLDivElement>(null);
  const filterPanelWrapperRef = useRef<HTMLDivElement>(null);
  const [listAreaTop, setListAreaTop] = useState(120);

  // Memoized filtered sprints based on appliedFilters
  const filteredSprints = useMemo(() => {
    return sprints.filter(sprint => {
      // Tag filtering
      let tagsMatch = true;
      if (isTagFilterEnabled && appliedFilters.tags.length > 0) {
        tagsMatch = appliedFilters.tags.every(filterTag => sprint.tags?.includes(filterTag));
      }

      // Date range filtering
      let dateMatch = true;
      if (isDateFilterEnabled && (appliedFilters.dateRange?.startDate || appliedFilters.dateRange?.endDate)) {
        const sprintDate = new Date(sprint.completedAt);
        if (appliedFilters.dateRange?.startDate && appliedFilters.dateRange?.endDate) {
          const startDate = new Date(appliedFilters.dateRange.startDate);
          const endDate = new Date(appliedFilters.dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = sprintDate >= startDate && sprintDate <= endDate;
        } else if (appliedFilters.dateRange?.startDate) {
          const startDate = new Date(appliedFilters.dateRange.startDate);
          dateMatch = sprintDate >= startDate;
        } else if (appliedFilters.dateRange?.endDate) {
          const endDate = new Date(appliedFilters.dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = sprintDate <= endDate;
        }
      }

      // Content filtering
      let contentMatch = true;
      if (isContentFilterEnabled && appliedFilters.contentQuery && appliedFilters.contentQuery.trim() !== '') {
        const query = appliedFilters.contentQuery.toLowerCase();
        contentMatch = sprint.content.toLowerCase().includes(query);
      }

      return tagsMatch && dateMatch && contentMatch;
    });
  }, [sprints, appliedFilters, isTagFilterEnabled, isDateFilterEnabled, isContentFilterEnabled]);

  // Derived state for the "Select All" checkbox
  const allVisibleSprintsSelected = useMemo(() => {
    if (!filteredSprints || filteredSprints.length === 0) return false;
    return filteredSprints.every(sprint => sprint.id && selectedSprintIdsForExport.includes(sprint.id));
  }, [filteredSprints, selectedSprintIdsForExport]);

  // Handle "Select All" checkbox change
  const handleSelectAllVisibleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    if (checked) {
      const visibleSprintIds = filteredSprints.map(sprint => sprint.id).filter(id => !!id) as string[];
      setSelectedSprintIdsForExport(prevSelected => Array.from(new Set([...prevSelected, ...visibleSprintIds])));
    } else {
      const visibleSprintIds = filteredSprints.map(sprint => sprint.id);
      setSelectedSprintIdsForExport(prevSelected => prevSelected.filter(id => !visibleSprintIds.includes(id)));
    }
  };

  // Function to load sprint history - this should NOT depend on selectedSprint
  const loadSprints = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sprintData = await historyService.getSprints(user.uid);

      setSprints(sprintData);

      // Select the first sprint if available and none is currently selected
      if (sprintData.length > 0 && !selectedSprint) {
        setSelectedSprint(sprintData[0]);
      } else if (selectedSprint) {
        // Update the selected sprint if it still exists in the list
        const updatedSelectedSprint = sprintData.find(sprint => sprint.id === selectedSprint.id);
        if (updatedSelectedSprint) {
          setSelectedSprint(updatedSelectedSprint);
        } else if (sprintData.length > 0) {
          setSelectedSprint(sprintData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  }, [user]); // Removed selectedSprint from dependencies

  // 1. Effect to load sprints initially and on user change
  useEffect(() => {
    loadSprints();

    // DO NOT add sprint completed event listener here - it will cause rerenders

  }, [user]); // Only depend on user, not loadSprints

  // 2. Effect to handle sprint completion events - MUST be separate
  useEffect(() => {
    // Subscribe to sprint completed event to refresh the list
    const unsubscribe = eventService.subscribe(EVENTS.SPRINT_COMPLETED, () => {
      loadSprints();
    });

    return () => {
      unsubscribe();
    };
  }, [user, loadSprints]); // Ensure loadSprints is stable or correctly memoized if added here

  // 3. Effect to handle keyboard navigation - MUST be separate
  useEffect(() => {
    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys if inside the tag input
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();

        if (filteredSprints.length === 0 || !selectedSprint) return;

        const currentIndex = filteredSprints.findIndex(sprint => sprint.id === selectedSprint.id);

        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if (e.key === 'ArrowDown' && currentIndex < filteredSprints.length - 1) {
          newIndex = currentIndex + 1;
        }

        if (newIndex !== currentIndex) {
          setSelectedSprint(filteredSprints[newIndex]);
          // Focus back on the content viewer
          if (contentViewerRef.current) {
            contentViewerRef.current.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredSprints, selectedSprint]);

  // Effect to adjust selectedSprint when filters change or sprints load
  useEffect(() => {
    if (loading) return; // Don't adjust selection while sprints are loading

    if (filteredSprints.length === 0) {
      setSelectedSprint(null); // No sprints match, so no selection
      return;
    }

    // If there's a selected sprint, check if it's still in the filtered list
    if (selectedSprint) {
      const isSelectedStillVisible = filteredSprints.some(s => s.id === selectedSprint.id);
      if (!isSelectedStillVisible) {
        // Selected sprint is filtered out, select the first of the filtered list
        setSelectedSprint(filteredSprints[0]);
      }
      // If it is still visible, do nothing, keep current selection
    } else {
      // No sprint currently selected, select the first from the filtered list if available
      setSelectedSprint(filteredSprints[0]);
    }
  }, [filteredSprints, selectedSprint, loading]);

  // Calculate dynamic top for the list area
  useLayoutEffect(() => {
    let exportPanelHeight = 0;
    if (isExportSelectionModeActive && exportPanelWrapperRef.current) {
      exportPanelHeight = exportPanelWrapperRef.current.offsetHeight;
    }

    let filterPanelHeight = 0;
    if (isFilterPanelVisible && filterPanelWrapperRef.current) {
      // If visible and ref is set, measure height
      filterPanelHeight = filterPanelWrapperRef.current.offsetHeight;
    } 
    // If not visible, or ref not set yet in this cycle, panelHeight remains 0.
    
    if (headerRef.current) {
      const newTop = headerRef.current.offsetHeight + exportPanelHeight + filterPanelHeight;
      setListAreaTop(newTop);
    }
    // Dependencies: isFilterPanelVisible is crucial.
    // loading (if header changes), sprints/appliedFilters (if FilterPanel content changes affecting its height and it's visible)
  }, [isFilterPanelVisible, isExportSelectionModeActive, loading, sprints, appliedFilters, headerRef, filterPanelWrapperRef, exportPanelWrapperRef]);

  // Memoize the handleSelectSprint function to prevent unnecessary recreations
  const handleSelectSprint = useCallback((sprint: Sprint) => {
    setSelectedSprint(sprint);
  }, []);

  // Handle adding a tag
  const handleAddTag = async () => {
    if (!selectedSprint?.id || !newTag.trim()) return;
    const currentSelectedSprintId = selectedSprint.id;
    const tagToAdd = newTag.trim();

    try {
      await historyService.addTag(currentSelectedSprintId, tagToAdd);
      
      setSprints(prevSprints =>
        prevSprints.map(s => {
          if (s.id === currentSelectedSprintId) {
            const updatedSprint = {
              ...s,
              tags: [...(s.tags || []), tagToAdd],
            };
            // If the sprint being updated is the currently selected one, update selectedSprint state
            if (selectedSprint && selectedSprint.id === currentSelectedSprintId) {
              setSelectedSprint(updatedSprint);
            }
            return updatedSprint;
          }
          return s;
        })
      );
      setNewTag('');
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = async (tagToRemove: string) => {
    if (!selectedSprint?.id) return;
    const currentSelectedSprintId = selectedSprint.id;

    try {
      await historyService.removeTag(currentSelectedSprintId, tagToRemove);

      setSprints(prevSprints =>
        prevSprints.map(s => {
          if (s.id === currentSelectedSprintId) {
            const updatedSprint = {
              ...s,
              tags: s.tags?.filter(t => t !== tagToRemove) || [],
            };
            // If the sprint being updated is the currently selected one, update selectedSprint state
            if (selectedSprint && selectedSprint.id === currentSelectedSprintId) {
              setSelectedSprint(updatedSprint);
            }
            return updatedSprint;
          }
          return s;
        })
      );
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  // Handle filter changes from FilterPanel
  const handleFiltersChange = useCallback((newFilters: AppliedFilters) => {
    setAppliedFilters(newFilters);
  }, []);

  // Handle key press in tag input (submit on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleExportTxt = () => {
    if (selectedSprintIdsForExport.length === 0) return;

    // 1. Get full sprint objects for selected IDs
    const sprintsToExport = sprints
      .filter(sprint => sprint.id && selectedSprintIdsForExport.includes(sprint.id))
      // 2. Sort them chronologically (oldest first)
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    if (sprintsToExport.length === 0) return; // Should not happen if selectedSprintIdsForExport is not empty

    // 3. Generate aggregated metadata
    const firstSprintDate = new Date(sprintsToExport[0].completedAt).toLocaleString();
    const lastSprintDate = new Date(sprintsToExport[sprintsToExport.length - 1].completedAt).toLocaleString();
    const totalWordCount = sprintsToExport.reduce((sum, s) => sum + s.wordCount, 0);
    const totalDurationSeconds = sprintsToExport.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0);
    
    // Use existing formatDuration for total duration if it suits, or create a more detailed one
    const totalWritingTimeFormatted = formatDuration(totalDurationSeconds); // Assuming formatDuration can handle large second counts

    const allTags = Array.from(new Set(sprintsToExport.flatMap(s => s.tags || []))).join(', ');

    const metadataHeader = [
      `QuickPen Export`,
      ``,
      `Number of Sprints Selected: ${sprintsToExport.length}`,
      `Date Range: ${firstSprintDate} - ${lastSprintDate}`,
      `Total Word Count: ${totalWordCount}`,
      `Total Writing Time: ${totalWritingTimeFormatted}`,
      `All Unique Tags: ${allTags || 'None'}`,
      ``,
      `---------------`
    ].join('\n');

    // 4. Concatenate content
    const concatenatedContent = sprintsToExport.map(s => s.content).join('\n\n');

    // 5. Combine metadata and content
    const fullContent = `${metadataHeader}\n\n${concatenatedContent}`;

    // 6. Trigger download
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, 'Z'); // Cleaner timestamp
    link.download = `QuickPen_Export_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 7. Optionally reset export mode
    setIsExportSelectionModeActive(false);
    setSelectedSprintIdsForExport([]);
  };

  const handleExportPdf = async () => {
    if (selectedSprintIdsForExport.length === 0 || exportingPdf) return;

    setExportingPdf(true);

    try {
      const sprintsToExport = sprints
        .filter(sprint => sprint.id && selectedSprintIdsForExport.includes(sprint.id))
        .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

      if (sprintsToExport.length === 0) return;

      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\.\d+Z$/, 'Z');
      const fileName = `QuickPen_Export_${timestamp}.pdf`;

      // Generate blob
      const blob = await pdf(<SprintPDFDocument sprints={sprintsToExport} />).toBlob();
      
      // Trigger download
      saveAs(blob, fileName);

    } catch (error) {
      console.error("Error generating or saving PDF:", error);
      // Here you might want to show an error notification to the user
    } finally {
      setExportingPdf(false);
      // Optionally reset export mode
      setIsExportSelectionModeActive(false);
      setSelectedSprintIdsForExport([]);
    }
  };

  if (!user) {
    return <p className="text-center">Please log in to view your sprint history.</p>;
  }

  return (
    <Container fluid>
      <Row className="g-4">
        <Col lg={4} md={5}>
          <Card className="shadow-sm h-100 position-relative">
            <Card.Header ref={headerRef} className="bg-body-tertiary d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h5 className="mb-0 me-3">Sprint History</h5>
              </div>
              <div className="d-flex align-items-center">
                <Button
                  variant="link"
                  onClick={() => setIsExportSelectionModeActive(!isExportSelectionModeActive)}
                  aria-label={isExportSelectionModeActive ? "Hide export panel" : "Prepare Export"}
                  title={isExportSelectionModeActive ? "Hide export panel" : "Prepare Export"}
                  className="p-1 text-secondary me-2"
                >
                  <i className={`bi ${isExportSelectionModeActive ? 'bi-file-earmark-arrow-up-fill' : 'bi-file-earmark-arrow-up'}`} style={{ fontSize: '1.25rem' }}></i>
                </Button>
                <Button
                  variant="link"
                  onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
                  aria-label={isFilterPanelVisible ? "Hide filters" : "Show filters"}
                  title={isFilterPanelVisible ? "Hide filters" : "Show filters"}
                  className="p-1 text-secondary"
                >
                  <i className={`bi ${isFilterPanelVisible ? 'bi-funnel-fill' : 'bi-funnel'}`} style={{ fontSize: '1.25rem' }}></i>
                </Button>
              </div>
            </Card.Header>

            {isExportSelectionModeActive && (
              <div ref={exportPanelWrapperRef}>
                <ExportPanel
                  onCancel={() => {
                    setIsExportSelectionModeActive(false);
                    setSelectedSprintIdsForExport([]);
                  }}
                  onExportTxt={handleExportTxt}
                  onExportPdf={handleExportPdf}
                  onSelectAllChange={handleSelectAllVisibleChange}
                  allVisibleSprintsSelected={allVisibleSprintsSelected}
                  selectedCount={selectedSprintIdsForExport.length}
                  totalCount={filteredSprints.length}
                  disabled={loading || exportingPdf} // Disable panel while exporting
                  exportingPdf={exportingPdf} // Pass exporting state
                />
              </div>
            )}
            
            {isFilterPanelVisible && (
              <div ref={filterPanelWrapperRef} className="p-3 border-bottom">
                <FilterPanel 
                  allSprints={sprints} 
                  currentAppliedFilters={appliedFilters}
                  onFiltersChange={handleFiltersChange} 
                  isTagFilterEnabled={isTagFilterEnabled}
                  onSetIsTagFilterEnabled={setIsTagFilterEnabled}
                  isDateFilterEnabled={isDateFilterEnabled}
                  onSetIsDateFilterEnabled={setIsDateFilterEnabled}
                  isContentFilterEnabled={isContentFilterEnabled}
                  onSetIsContentFilterEnabled={setIsContentFilterEnabled}
                />
              </div>
            )}

            {loading ? (
              <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: `${listAreaTop}px`,
                  left: '0px',
                  right: '0px',
                  bottom: '1px',
                  overflowY: 'auto',
                }}
              >
                <div 
                  className="list-container d-none d-md-block"
                >
                  <ListGroup variant="flush" className="border-0">
                    {filteredSprints.length === 0 ? (
                      <ListGroup.Item className="text-center py-5 text-muted">
                        {(appliedFilters.tags.length > 0 || appliedFilters.dateRange?.startDate || appliedFilters.dateRange?.endDate || appliedFilters.contentQuery) ? 
                          "No sprints match the selected filters." : 
                          "No sprints found. Complete your first sprint to see it here!"
                        }
                      </ListGroup.Item>
                    ) : (
                      filteredSprints.map(sprint => {
                        if (!sprint || !sprint.id) return null; // Guard against undefined sprint or id

                        const isSelectedForViewing = selectedSprint?.id === sprint.id;
                        const isCheckedForExport = selectedSprintIdsForExport.includes(sprint.id);

                        const handleCheckboxChange = () => {
                          if (!sprint.id) return; // Should not happen due to guard above, but good for safety
                          setSelectedSprintIdsForExport(prevSelectedIds =>
                            isCheckedForExport
                              ? prevSelectedIds.filter(id => id !== sprint.id)
                              : [...prevSelectedIds, sprint.id!]
                          );
                        };

                        return (
                          <ListGroup.Item
                            key={sprint.id}
                            action
                            active={isSelectedForViewing && !isExportSelectionModeActive}
                            onClick={() => !isExportSelectionModeActive && handleSelectSprint(sprint)}
                            className="border-bottom d-flex align-items-center" // d-flex for checkbox and content alignment
                            style={isExportSelectionModeActive && isCheckedForExport ? { backgroundColor: 'var(--bs-primary-bg-subtle)' } : {}}
                          >
                            {isExportSelectionModeActive && (
                              <Form.Check
                                type="checkbox"
                                id={`sprint-checkbox-${sprint.id}`}
                                checked={isCheckedForExport}
                                onChange={handleCheckboxChange}
                                onClick={(e) => e.stopPropagation()} // Prevent ListGroup.Item onClick
                                className="me-3 flex-shrink-0" // flex-shrink-0 to prevent checkbox from shrinking
                                aria-label={`Select sprint completed at ${sprint.completedAt.toLocaleString()}`}
                              />
                            )}
                            {/* This div now wraps all sprint content details, allowing checkbox to be a direct sibling for flex alignment */}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="mb-1">
                                    <strong>{sprint.wordCount} words</strong>
                                    {sprint.tags && sprint.tags.length > 0 && (
                                      <Badge bg="accent2" pill className="ms-2" style={{ fontSize: '0.65rem' }}>
                                        {sprint.tags.length} {sprint.tags.length === 1 ? 'tag' : 'tags'}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-muted small">
                                    {formatDistanceToNow(new Date(sprint.completedAt), { addSuffix: true })}
                                  </div>
                                </div>
                                <div className="text-end">
                                  <div className="mb-1">{formatDuration(sprint.actualDuration || sprint.duration)}</div>
                                  <div className="text-muted small">
                                    {sprint.endedEarly ? 'Ended early' : 'Completed'}
                                  </div>
                                </div>
                              </div>
                              {sprint.tags && sprint.tags.length > 0 && (
                                <div className="mt-2">
                                  {sprint.tags.map(tag => (
                                    <Badge
                                      key={tag}
                                      bg="accent1"
                                      className="me-1 mb-1"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </ListGroup.Item>
                        );
                      })
                    )}
                  </ListGroup>
                </div>

                <div className="d-md-none p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <ListGroup variant="flush" className="border-0">
                    {filteredSprints.length === 0 ? (
                      <ListGroup.Item className="text-center py-5 text-muted">
                        {(appliedFilters.tags.length > 0 || appliedFilters.dateRange?.startDate || appliedFilters.dateRange?.endDate || appliedFilters.contentQuery) ? 
                          "No sprints match the selected filters." : 
                          "No sprints found. Complete your first sprint to see it here!"
                        }
                      </ListGroup.Item>
                    ) : (
                      filteredSprints.map(sprint => {
                        if (!sprint || !sprint.id) return null; // Guard for mobile view as well

                        const isSelectedForViewing = selectedSprint?.id === sprint.id;
                        const isCheckedForExport = selectedSprintIdsForExport.includes(sprint.id);

                        const handleCheckboxChangeMobile = () => {
                          if (!sprint.id) return;
                          setSelectedSprintIdsForExport(prevSelectedIds =>
                            isCheckedForExport
                              ? prevSelectedIds.filter(id => id !== sprint.id)
                              : [...prevSelectedIds, sprint.id!]
                          );
                        };

                        return (
                          <ListGroup.Item
                            key={`mobile-${sprint.id}`}
                            action
                            active={isSelectedForViewing && !isExportSelectionModeActive}
                            onClick={() => !isExportSelectionModeActive && handleSelectSprint(sprint)}
                            className="border-bottom d-flex align-items-center"
                            style={isExportSelectionModeActive && isCheckedForExport ? { backgroundColor: 'var(--bs-primary-bg-subtle)' } : {}}
                          >
                            {isExportSelectionModeActive && (
                              <Form.Check
                                type="checkbox"
                                id={`sprint-checkbox-mobile-${sprint.id}`}
                                checked={isCheckedForExport}
                                onChange={handleCheckboxChangeMobile}
                                onClick={(e) => e.stopPropagation()}
                                className="me-3 flex-shrink-0"
                                aria-label={`Select sprint completed at ${sprint.completedAt.toLocaleString()} (mobile)`}
                              />
                            )}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="mb-1">
                                    <strong>{sprint.wordCount} words</strong>
                                    {sprint.tags && sprint.tags.length > 0 && (
                                      <Badge bg="accent2" pill className="ms-2" style={{ fontSize: '0.65rem' }}>
                                        {sprint.tags.length} {sprint.tags.length === 1 ? 'tag' : 'tags'}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-muted small">
                                    {formatDistanceToNow(new Date(sprint.completedAt), { addSuffix: true })}
                                  </div>
                                </div>
                                <div className="text-end">
                                  <div className="mb-1">{formatDuration(sprint.actualDuration || sprint.duration)}</div>
                                  <div className="text-muted small">
                                    {sprint.endedEarly ? 'Ended early' : 'Completed'}
                                  </div>
                                </div>
                              </div>
                              {sprint.tags && sprint.tags.length > 0 && (
                                <div className="mt-2">
                                  {sprint.tags.map(tag => (
                                    <Badge
                                      key={tag}
                                      bg="accent1"
                                      className="me-1 mb-1"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </ListGroup.Item>
                        );
                      })
                    )}
                  </ListGroup>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col lg={8} md={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sprint Content</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center p-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : selectedSprint ? (
                <>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Use <kbd>↑</kbd> and <kbd>↓</kbd> arrow keys to navigate between sprints
                  </p>
                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      rows={12}
                      value={selectedSprint.content}
                      readOnly
                      className="mb-3 border-primary"
                      style={{ minHeight: '250px', fontSize: '0.95rem', lineHeight: '1.5' }}
                      ref={contentViewerRef}
                    />
                  </Form.Group>

                  <Card className="border-0 mb-4 bg-accent2 bg-opacity-25">
                    <Card.Body>
                      <h6 className="mb-3">Tags</h6>
                      <div className="d-flex flex-wrap mb-3">
                        {selectedSprint.tags?.map(tag => (
                          <Badge
                            key={tag}
                            bg="accent1"
                            className="me-2 mb-2 p-2"
                          >
                            {tag}
                            <span
                              className="ms-2 tag-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(tag);
                              }}
                            >
                              &times;
                            </span>
                          </Badge>
                        ))}
                        {(!selectedSprint.tags || selectedSprint.tags.length === 0) && (
                          <span className="text-muted fst-italic">No tags added yet</span>
                        )}
                      </div>

                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={handleTagKeyPress}
                          size="sm"
                        />
                        <Button
                          variant="primary"
                          className="ms-2"
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>

                  <div className="d-flex flex-wrap justify-content-between text-muted small gap-3 border-top pt-3">
                    <div>
                      <strong>Words:</strong> {selectedSprint.wordCount}
                    </div>
                    <div>
                      <strong>WPM:</strong> {
                        Math.round(selectedSprint.wordCount / ((selectedSprint.actualDuration || selectedSprint.duration) / 60))
                      }
                    </div>
                    <div>
                      <strong>Duration:</strong> {formatDuration(selectedSprint.actualDuration || selectedSprint.duration)}
                    </div>
                    <div>
                      <strong>Completed:</strong> {selectedSprint.completedAt.toLocaleString()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  {filteredSprints.length > 0
                    ? 'Select a sprint to view its content'
                    : 'No sprints available. Complete your first sprint!'}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SprintHistoryContainer;