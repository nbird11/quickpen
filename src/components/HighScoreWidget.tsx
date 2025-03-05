import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { highScoreService, HighScoreCategory, StreakResult } from '../services/highscore';
import { eventService, EVENTS } from '../services/events';
import { Sprint } from '../types/sprint';

const HighScoreWidget: React.FC = () => {
  const [bestSprints, setBestSprints] = useState<Record<HighScoreCategory, Sprint | null>>({
    wpm: null,
    words: null,
    duration: null
  });
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Use useCallback to memoize the loadHighScores function
  const loadHighScores = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Load best sprint for each category
      const categories: HighScoreCategory[] = ['wpm', 'words', 'duration'];
      const results: Record<HighScoreCategory, Sprint | null> = {
        wpm: null,
        words: null,
        duration: null
      };

      // Load all categories in parallel
      await Promise.all(
        categories.map(async (category) => {
          const sprint = await highScoreService.getBestSprint(user.uid, category);
          results[category] = sprint;
        })
      );

      // Load best streak
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const streakResult: StreakResult = await highScoreService.getBestStreak(user.uid, timezone);

      setBestSprints(results);
      setBestStreak(streakResult.length);
    } catch (error) {
      console.error('Error loading high scores:', error);
      setError('Failed to load high scores. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load of high scores
  useEffect(() => {
    loadHighScores();
  }, [loadHighScores]);

  // Subscribe to sprint completion events
  useEffect(() => {
    // When a sprint is completed, refresh the high scores
    const unsubscribe = eventService.subscribe(EVENTS.SPRINT_COMPLETED, () => {
      loadHighScores();
    });

    // Clean up subscription when component unmounts
    return () => unsubscribe();
  }, [loadHighScores]);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate WPM for display
  const calculateWPM = (sprint: Sprint | null): string => {
    if (!sprint) return '0';

    const durationMinutes = (sprint.actualDuration || sprint.duration) / 60;
    const wpm = sprint.wordCount / durationMinutes;
    return wpm.toFixed(2);
  };

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
      <h2 className="mb-4">High Scores</h2>
      <Row>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              {loading ? (
                <Spinner animation="border" variant="primary" />
              ) : (
                <>
                  <h3 className="display-4">
                    {bestSprints.words ? bestSprints.words.wordCount : '0'}
                  </h3>
                  <Card.Text>Most Words</Card.Text>
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
                  <h3 className="display-4">
                    {calculateWPM(bestSprints.wpm)}
                  </h3>
                  <Card.Text>Highest WPM</Card.Text>
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
                  <h3 className="display-4">
                    {bestSprints.duration ? formatDuration(bestSprints.duration.actualDuration || bestSprints.duration.duration) : '0:00'}
                  </h3>
                  <Card.Text>Longest Session</Card.Text>
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
                  <h3 className="display-4">{bestStreak}</h3>
                  <Card.Text>Longest Streak 🔥</Card.Text>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HighScoreWidget;