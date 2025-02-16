import React, { useState, useEffect, useRef } from 'react';

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
      if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;
      return (minutes * 60) + seconds;
    }

    // Try minutes only format
    const minutes = Number(input);
    return isNaN(minutes) ? null : minutes * 60;
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
    if (timerInterval.current) clearInterval(timerInterval.current);

    timerInterval.current = setInterval(() => {
      setTimer(prev => {
        if (prev.timeRemaining <= 0 || prev.isPaused) return prev;

        const newTimeRemaining = prev.timeRemaining - 1;
        if (newTimeRemaining <= 0) {
          clearInterval(timerInterval.current!);
          // TODO: Handle sprint completion
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  };

  const togglePause = () => {
    setTimer(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const toggleTimerDisplay = () => {
    setTimer(prev => ({ ...prev, isVisible: !prev.isVisible }));
  };

  const handleDiscard = () => {
    if (!window.confirm('Are you sure you want to discard this sprint? All progress will be lost.')) {
      return;
    }

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

  const handleEndSprint = () => {
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

    // TODO: Save sprint data
    handleDiscard();
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
    <section className="container sprint-interface">
      {!sprint.isActive ? (
        <div className="card p-4">
          <h2 className="mb-4">Start a Writing Sprint</h2>
          <div className="mb-3">
            <label htmlFor="duration" className="form-label">
              Duration: <span className="font-monospace">([M...]M[:SS])</span>
            </label>
            <input
              type="text"
              id="duration"
              className={`form-control ${durationError ? 'is-invalid' : ''}`}
              value={durationInput}
              onChange={(e) => {
                setDurationInput(e.target.value);
                setDurationError(null);
              }}
              placeholder="e.g. 10:00, 30, 90:30"
            />
            {durationError && (
              <div className="invalid-feedback">{durationError}</div>
            )}
          </div>
          <button type="button" className="btn btn-primary" onClick={handleStartSprint}>
            Start Sprint
          </button>
        </div>
      ) : (
        <div className="card p-4">
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-center gap-3">
              <div className={`fs-1 font-monospace ${!timer.isVisible ? 'opacity-0' : ''}`}>
                {formatTime(timer.timeRemaining)}
              </div>
              <img
                src="./timer.svg"
                alt="Toggle Timer"
                className="opacity-75 hover-opacity-100 cursor-pointer"
                style={{ width: '24px', height: '24px', transition: 'opacity 0.2s ease' }}
                onClick={toggleTimerDisplay}
              />
            </div>
            <div className="progress mt-2" style={{ height: '4px' }}>
              <div
                className="progress-bar bg-success"
                style={{
                  width: `${((timer.totalDuration - timer.timeRemaining) / timer.totalDuration) * 100}%`,
                  transition: 'width 1s linear'
                }}
              />
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-center mb-4 flex-column flex-sm-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={togglePause}
            >
              {timer.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDiscard}
            >
              Discard
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleEndSprint}
            >
              End Sprint
            </button>
          </div>

          <div>
            <textarea
              className="form-control mb-2"
              value={sprint.content}
              onChange={handleContentChange}
              placeholder="Start writing here when the timer begins..."
              disabled={timer.isPaused}
              style={{ minHeight: '300px', resize: 'vertical' }}
            />
            <div className="text-end text-muted small">
              Words: <span>{sprint.wordCount}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SprintInterface;