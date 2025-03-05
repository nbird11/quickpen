import { Container } from 'react-bootstrap';
import SprintHistoryContainer from '../components/SprintHistoryContainer';

const History = () => {
  return (
    <Container as="main" className="py-4">
      <h1 className="mb-4">Sprint History</h1>
      <SprintHistoryContainer />
    </Container>
  );
};

export default History;