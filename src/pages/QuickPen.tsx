import { Container } from 'react-bootstrap';
import SprintInterface from '../components/SprintInterface';
import ProgressWidget from '../components/ProgressWidget';

const QuickPen = () => {
  return (
    <Container as="main" className="py-4">
      <ProgressWidget />
      <SprintInterface />
    </Container>
  );
};

export default QuickPen;