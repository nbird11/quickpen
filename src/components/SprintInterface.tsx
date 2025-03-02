import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useAppSelector } from '../store/hooks';
import { sprintService } from '../services/sprint';
import { Sprint } from '../types/sprint';
import { eventService, EVENTS } from '../services/events';
import timerIcon from '../assets/timer.svg';

interface TimerState {
  timeRemaining: number; // in seconds
  totalDuration: number; // in seconds
  isPaused: boolean;
  isVisible: boolean;
}

interface SprintState {
  isActive: boolean;
  content: string;
  wordCount: number;
}

const SprintInterface: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    timeRemaining: 0,
    totalDuration: 0,
    isPaused: false,
    isVisible: true
  });

  // Sprint state
  const [sprint, setSprint] = useState<SprintState>({
    isActive: false,
    content: '',
    wordCount: 0
  });

  // Duration input state
  const [durationInput, setDurationInput] = useState('');
  const [durationError, setDurationError] = useState<string | null>(null);

  // Timer interval ref
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Helper function to parse duration input (MM:SS or M)
  const parseDuration = (input: string): number | null => {
    if (!input) return null;

    // Try MM:SS format
    if (input.includes(':')) {
      const [minutes, seconds] = input.split(':').map(Number);
      if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || minutes < 0 || seconds < 0) return null;
      return (minutes * 60) + seconds;
    }

    // Try minutes only format
    const minutes = Number(input);
    return isNaN(minutes) || minutes <= 0 ? null : minutes * 60;
  };

  // Helper function to format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to count words
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Start sprint handler
  const handleStartSprint = () => {
    const durationSeconds = parseDuration(durationInput);
    if (!durationSeconds) {
      setDurationError('Please enter a valid duration (e.g. 10:00, 30, 90:30)');
      return;
    }

    setDurationError(null);
    setTimer(prev => ({
      ...prev,
      timeRemaining: durationSeconds,
      totalDuration: durationSeconds
    }));

    setSprint(prev => ({
      ...prev,
      isActive: true,
      content: '',
      wordCount: 0
    }));

    startTimer();
  };

  // Timer control functions
  const startTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    timerInterval.current = setInterval(() => {
      setTimer(prev => {
        // Skip if paused or already at 0
        if (prev.isPaused || prev.timeRemaining <= 0) {
          return prev;
        }

        const newTimeRemaining = prev.timeRemaining - 1;
        
        // If we hit 0, clear the interval
        if (newTimeRemaining === 0) {
          clearInterval(timerInterval.current!);
        }
        
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  };

  // Watch for timer reaching 0 and handle completion
  useEffect(() => {
    if (timer.timeRemaining === 0 && sprint.isActive) {
      handleSprintCompletion(true);
    }
  }, [timer.timeRemaining, sprint.isActive]);

  const togglePause = () => {
    setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const toggleTimerDisplay = () => {
    setTimer(prev => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const resetInterface = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    setTimer(prev => ({
      ...prev,
      timeRemaining: 0,
      totalDuration: 0,
      isPaused: false
    }));

    setSprint(prev => ({
      ...prev,
      isActive: false,
      content: '',
      wordCount: 0
    }));

    setDurationInput('');
    setDurationError(null);
  };

  const handleDiscard = () => {
    if (!window.confirm('Are you sure you want to discard this sprint? All progress will be lost.')) {
      return;
    }

    resetInterface();
  };

  // Handle sprint completion
  const handleSprintCompletion = async (timerRanOut: boolean) => {
    // Prevent multiple completions
    if (!sprint.isActive) return;

    try {
      const sprintData = {
        userId: user!.uid,
        content: sprint.content,
        wordCount: sprint.wordCount,
        duration: timer.totalDuration,
        completedAt: new Date(),
        endedEarly: !timerRanOut,  // Flip boolean: timerRanOut=true means endedEarly=false
        ...(((!timerRanOut) && { actualDuration: timer.totalDuration - timer.timeRemaining }))
      } as Omit<Sprint, 'id'>;

      // Save first
      await sprintService.saveSprint(sprintData);
      
      // Emit event to notify other components
      eventService.emit(EVENTS.SPRINT_COMPLETED);
      
      // Then reset interface
      resetInterface();
    } catch (error) {
      console.error('Error saving sprint:', error);
      alert('Failed to save your sprint. Please try again.');
    }
  };

  const handleEndSprint = async () => {
    if (timer.timeRemaining > 0) {
      if (sprint.content.trim().length === 0) {
        if (window.confirm('No content was written. Discard this sprint?')) {
          handleDiscard();
          return;
        }
      } else if (!window.confirm('Are you sure you want to end this sprint early?')) {
        return;
      }
    }

    await handleSprintCompletion(false);
  };

  // Content change handler
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setSprint(prev => ({
      ...prev,
      content: newContent,
      wordCount: countWords(newContent)
    }));
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return (
    <Container as="section" className="sprint-interface">
      {!sprint.isActive ? (
        <Card className="p-4">
          <Card.Body>
            <h2 className="mb-4">Start a Writing Sprint</h2>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="duration">
                Duration: <span className="font-monospace">([M...]M[:SS])</span>
              </Form.Label>
              <Form.Control
                type="text"
                id="duration"
                isInvalid={!!durationError}
                value={durationInput}
                onChange={(e) => {
                  setDurationInput(e.target.value);
                  setDurationError(null);
                }}
                placeholder="e.g. 10:00, 30, 90:30"
              />
              {durationError && <Form.Control.Feedback type="invalid">{durationError}</Form.Control.Feedback>}
            </Form.Group>
            <Button variant="primary" onClick={handleStartSprint}>Start Sprint</Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="sprint-active">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-3">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={toggleTimerDisplay}
              >
                <img src={timerIcon} alt="Timer" className="me-2" style={{ width: '16px', height: '16px' }} />
                {timer.isVisible ? 'Hide Timer' : 'Show Timer'}
              </Button>
              {timer.isVisible && (
                <div className="timer-display">
                  <span className="font-monospace">{formatTime(timer.timeRemaining)}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={togglePause}
                    className="ms-2"
                  >
                    {timer.isPaused ? '▶' : '⏸'}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={handleDiscard}
                className="me-2"
              >
                Discard
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleEndSprint}
              >
                End Sprint
              </Button>
            </div>
          </div>

          <div className="progress mb-3" style={{ height: '4px' }}>
            <div 
              className={`progress-bar ${timer.timeRemaining / timer.totalDuration >= .5 ? 'bg-success' : timer.timeRemaining / timer.totalDuration >= .1 ? 'bg-warning' : 'bg-danger'}`}
              role="progressbar"
              style={{
                width: `${(timer.timeRemaining / timer.totalDuration) * 100}%`,
                transition: timer.isPaused ? 'none' : 'width 1s linear'
              }}
              aria-valuenow={(timer.timeRemaining / timer.totalDuration) * 100}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <Form.Group>
            <Form.Control
              as="textarea"
              rows={15}
              value={sprint.content}
              disabled={timer.isPaused}
              onChange={handleContentChange}
              placeholder="Start writing..."
              className="mb-3"
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Words: </strong>
              <span className="font-monospace">{sprint.wordCount}</span>
            </div>
            {timer.timeRemaining > 0 && !timer.isPaused && (
              <div className="text-muted">
                <small>Keep writing! Timer is running...</small>
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
};

export default SprintInterface;