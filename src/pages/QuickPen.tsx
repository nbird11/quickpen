import { Container } from 'react-bootstrap';
import SprintInterface from '../components/SprintInterface';
import ProgressWidget from '../components/ProgressWidget';
import HighScoreWidget from '../components/HighScoreWidget';

const QuickPen = () => {
  return (
    <Container as="main" className="py-4">
      <ProgressWidget />
      <SprintInterface />
      <HighScoreWidget />
    </Container>
  );
};

export default QuickPen;