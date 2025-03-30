import { Container } from 'react-bootstrap';
import SprintHistoryContainer from '../components/SprintHistoryContainer';

const History = () => {
  return (
    <Container as="main" className="py-4">
      <SprintHistoryContainer />
    </Container>
  );
};

export default History;