import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

interface ProgressStats {
  wordCount: number;
  averageWPM: number;
  minutesWritten: number;
  currentStreak: number;
}

type ProgressRange = 'today' | 'week' | 'month' | 'year' | 'total';

const ProgressWidget: React.FC = () => {
  const [progressRange, setProgressRange] = useState<ProgressRange>('today');
  const [stats, setStats] = useState<ProgressStats>({
    wordCount: 0,
    averageWPM: 0,
    minutesWritten: 0,
    currentStreak: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        // TODO: Replace with actual Firebase function call
        // const result = await functions.httpsCallable('getProgress')({ range: progressRange });
        // setStats(result.data);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();
  }, [progressRange, user]);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Your Progress</h2>
        <Form.Select 
          value={progressRange}
          onChange={(e) => setProgressRange(e.target.value as ProgressRange)}
          style={{ width: 'auto' }}
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
              <h3 className="display-4">{stats.wordCount}</h3>
              <Card.Text>Words Written</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="display-4">{stats.averageWPM.toFixed(2)}</h3>
              <Card.Text>WPM Average</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="display-4">{Math.round(stats.minutesWritten)}</h3>
              <Card.Text>Minutes Written</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h3 className="display-4">{stats.currentStreak}</h3>
              <Card.Text>Current Streak 🔥</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProgressWidget; 