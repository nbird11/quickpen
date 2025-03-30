import { Container } from 'react-bootstrap';
import SprintHistoryContainer from '../components/SprintHistoryContainer';

const History = () => {
  return (
    <Container as="main" className="pt-5">
      <SprintHistoryContainer />
    </Container>
  );
};

export default History;