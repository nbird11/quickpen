import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { ProgressRange, ProgressStats } from '../types/progress';
import { progressService } from '../services/progress';
import { eventService, EVENTS } from '../services/events';

const ProgressWidget: React.FC = () => {
  const [progressRange, setProgressRange] = useState<ProgressRange>('today');
  const [stats, setStats] = useState<ProgressStats>({
    wordCount: 0,
    averageWPM: 0,
    minutesWritten: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Use useCallback to memoize the loadProgress function so it doesn't recreate on every render
  const loadProgress = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use our Firestore service directly instead of Firebase Functions
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const progressStats = await progressService.getProgress(user.uid, progressRange, timezone);
      setStats(progressStats);
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Failed to load progress statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, progressRange]);

  // Effect for initial load and range changes
  useEffect(() => {
    loadProgress();
  }, [loadProgress]); // Since loadProgress is memoized, this is safe

  // Subscribe to sprint completion events
  useEffect(() => {
    // When a sprint is completed, refresh the data
    const unsubscribe = eventService.subscribe(EVENTS.SPRINT_COMPLETED, () => {
      loadProgress();
    });
    
    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [loadProgress]); // Only recreate when loadProgress changes, which depends on user and progressRange

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your Progress</h2>
        <Form.Select 
          value={progressRange}
          onChange={(e) => setProgressRange(e.target.value as ProgressRange)}
          style={{ width: 'auto' }}
          disabled={loading}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="total">Total</option>
        </Form.Select>
      </div>

      <Row>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <>
                  <h3 className="display-4">{stats.wordCount}</h3>
                  <Card.Text>Words Written</Card.Text>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <>
                  <h3 className="display-4">{stats.averageWPM.toFixed(2)}</h3>
                  <Card.Text>WPM Average</Card.Text>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <>
                  <h3 className="display-4">{Math.round(stats.minutesWritten)}</h3>
                  <Card.Text>Minutes Written</Card.Text>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <>
                  <h3 className="display-4">{stats.currentStreak}</h3>
                  <Card.Text>Current Streak 🔥</Card.Text>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProgressWidget; 