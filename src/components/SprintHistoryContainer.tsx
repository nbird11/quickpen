import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { historyService } from '../services/history';
import { Sprint } from '../types/sprint';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { eventService, EVENTS } from '../services/events';

const SprintHistoryContainer: React.FC = () => {
  console.log('[SprintHistory] Component rendering');
  const { user } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const contentViewerRef = useRef<HTMLTextAreaElement>(null);

  // Function to load sprint history - this should NOT depend on selectedSprint
  const loadSprints = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('[SprintHistory] Fetching sprints from service...');
      const sprintData = await historyService.getSprints(user.uid);
      console.log(`[SprintHistory] Got ${sprintData.length} sprints from service`);

      setSprints(sprintData);

      // Select the first sprint if available and none is currently selected
      if (sprintData.length > 0 && !selectedSprint) {
        console.log('[SprintHistory] Auto-selecting first sprint');
        setSelectedSprint(sprintData[0]);
      } else if (selectedSprint) {
        // Update the selected sprint if it still exists in the list
        const updatedSelectedSprint = sprintData.find(sprint => sprint.id === selectedSprint.id);
        if (updatedSelectedSprint) {
          console.log('[SprintHistory] Updating selected sprint with latest data');
          setSelectedSprint(updatedSelectedSprint);
        } else if (sprintData.length > 0) {
          console.log('[SprintHistory] Selected sprint no longer exists, selecting first sprint');
          setSelectedSprint(sprintData[0]);
        }
      }
    } catch (error) {
      console.error('[SprintHistory] Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  }, [user]); // Removed selectedSprint from dependencies

  // 1. Effect to load sprints initially and on user change
  useEffect(() => {
    console.log('[SprintHistory] Initial load effect triggered');
    loadSprints();

    // DO NOT add sprint completed event listener here - it will cause rerenders

  }, [user]); // Only depend on user, not loadSprints

  // 2. Effect to handle sprint completion events - MUST be separate
  useEffect(() => {
    console.log('[SprintHistory] Event subscription effect triggered');

    // Subscribe to sprint completed event to refresh the list
    const unsubscribe = eventService.subscribe(EVENTS.SPRINT_COMPLETED, () => {
      console.log('[SprintHistory] Sprint completed event received, refreshing history');
      loadSprints();
    });

    return () => {
      console.log('[SprintHistory] Cleaning up event subscription');
      unsubscribe();
    };
  }, [user]); // Only depend on user and loadSprints function

  // 3. Effect to handle keyboard navigation - MUST be separate
  useEffect(() => {
    console.log('[SprintHistory] Keyboard navigation effect triggered');

    // Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys if inside the tag input
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        console.log(`[SprintHistory] Arrow key pressed: ${e.key}`);
        e.preventDefault();

        if (sprints.length === 0 || !selectedSprint) return;

        const currentIndex = sprints.findIndex(sprint => sprint.id === selectedSprint.id);

        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if (e.key === 'ArrowDown' && currentIndex < sprints.length - 1) {
          newIndex = currentIndex + 1;
        }

        if (newIndex !== currentIndex) {
          console.log(`[SprintHistory] Moving selection from index ${currentIndex} to ${newIndex}`);
          setSelectedSprint(sprints[newIndex]);
          // Focus back on the content viewer
          if (contentViewerRef.current) {
            contentViewerRef.current.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      console.log('[SprintHistory] Cleaning up keyboard event listener');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sprints, selectedSprint]); // This depends on sprints and selectedSprint, but won't cause an infinite loop

  // Memoize the handleSelectSprint function to prevent unnecessary recreations
  const handleSelectSprint = useCallback((sprint: Sprint) => {
    console.log('[SprintHistory] Manual sprint selection:', sprint.id);
    setSelectedSprint(sprint);
  }, []);

  // Format duration from seconds to a readable format
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Handle adding a tag
  const handleAddTag = async () => {
    if (!selectedSprint?.id || !newTag.trim()) return;

    try {
      console.log(`[SprintHistory] Adding tag "${newTag}" to sprint ${selectedSprint.id}`);
      await historyService.addTag(selectedSprint.id, newTag.trim());

      // Update the selected sprint with the new tag
      setSelectedSprint(prev => {
        if (!prev) return null;

        const currentTags = prev.tags || [];
        console.log(`[SprintHistory] Updated tags:`, [...currentTags, newTag.trim()]);
        return {
          ...prev,
          tags: [...currentTags, newTag.trim()]
        };
      });

      // Clear the input
      setNewTag('');

      // Refresh the sprints list to update the selected sprint
      loadSprints();
    } catch (error) {
      console.error('[SprintHistory] Error adding tag:', error);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = async (tag: string) => {
    if (!selectedSprint?.id) return;

    try {
      console.log(`[SprintHistory] Removing tag "${tag}" from sprint ${selectedSprint.id}`);
      await historyService.removeTag(selectedSprint.id, tag);

      // Update the selected sprint without the removed tag
      setSelectedSprint(prev => {
        if (!prev) return null;

        const updatedTags = prev.tags?.filter(t => t !== tag) || [];
        console.log(`[SprintHistory] Updated tags after removal:`, updatedTags);
        return {
          ...prev,
          tags: updatedTags
        };
      });

      // Refresh the sprints list to update the selected sprint
      loadSprints();
    } catch (error) {
      console.error('[SprintHistory] Error removing tag:', error);
    }
  };

  // Handle key press in tag input (submit on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('[SprintHistory] Enter key pressed in tag input');
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!user) {
    console.log('[SprintHistory] No user found, showing login message');
    return <p className="text-center">Please log in to view your sprint history.</p>;
  }

  console.log('[SprintHistory] Rendering with:', {
    sprintsCount: sprints.length,
    selectedId: selectedSprint?.id,
    isLoading: loading
  });

  return (
    <Container fluid>
      <Row className="g-4">
        <Col lg={4} md={5}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Sprint History</h5>
            </Card.Header>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <ListGroup variant="flush" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {sprints.length === 0 ? (
                  <ListGroup.Item className="text-center py-5 text-muted">
                    No sprints found. Complete your first sprint to see it here!
                  </ListGroup.Item>
                ) : (
                  sprints.map(sprint => {
                    const isSelected = selectedSprint?.id === sprint.id;
                    console.log(`[SprintHistory] Rendering sprint ${sprint.id}, selected: ${isSelected}`);
                    return (
                      <ListGroup.Item
                        key={sprint.id}
                        action
                        active={isSelected}
                        onClick={() => handleSelectSprint(sprint)}
                        className="border-bottom"
                      >
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
                      </ListGroup.Item>
                    );
                  })
                )}
              </ListGroup>
            )}
          </Card>
        </Col>

        <Col lg={8} md={7}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-light">
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
                      <strong>Duration:</strong> {formatDuration(selectedSprint.actualDuration || selectedSprint.duration)}
                    </div>
                    <div>
                      <strong>Completed:</strong> {selectedSprint.completedAt.toLocaleString()}
                    </div>
                    <div>
                      <strong>Words:</strong> {selectedSprint.wordCount}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  {sprints.length > 0
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