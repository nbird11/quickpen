import { Hero } from '../components/Hero';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  ListGroup 
} from 'react-bootstrap';

const Home = () => {
  return (
    <>
      <Hero />

      {/* Features Section */}
      <section className="bg-white py-5">
        <Container>
          <h2 className="text-center mb-5">Why Choose QuickPen?</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-lift">
                <Card.Body>
                  <Card.Title as="h3" className="h5">⏱️ Timed Writing Sprints</Card.Title>
                  <Card.Text>
                    Set custom duration goals and challenge yourself to write without distractions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-lift">
                <Card.Body>
                  <Card.Title as="h3" className="h5">📊 Track Your Progress</Card.Title>
                  <Card.Text>
                    Monitor your writing stats, including word count, WPM, and daily streaks.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm hover-lift">
                <Card.Body>
                  <Card.Title as="h3" className="h5">🏆 Build Consistency</Card.Title>
                  <Card.Text>
                    Maintain your writing streak and achieve your writing goals.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="py-5 bg-sepia-light">
        <Container>
          <h2 className="text-center mb-5">Choose Your Plan</h2>
          <Row className="g-4 justify-content-center">
            <Col md={5}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <Card.Title as="h3">Free</Card.Title>
                  <div className="display-6 my-3">$0</div>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0">✓ Unlimited Writing Sprints</ListGroup.Item>
                    <ListGroup.Item className="border-0">✓ Basic Progress Tracking</ListGroup.Item>
                    <ListGroup.Item className="border-0">✓ Daily Streaks</ListGroup.Item>
                  </ListGroup>
                  <Button variant="outline-primary">Get Started</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5}>
              <Card className="h-100 border-primary">
                <Card.Body className="text-center">
                  <Card.Title as="h3">Pro</Card.Title>
                  <div className="display-6 my-3">$5/mo</div>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="border-0">✓ Everything in Free</ListGroup.Item>
                    <ListGroup.Item className="border-0">✓ Advanced Analytics</ListGroup.Item>
                    <ListGroup.Item className="border-0">✓ Custom Tags</ListGroup.Item>
                    <ListGroup.Item className="border-0">✓ Export Options</ListGroup.Item>
                  </ListGroup>
                  <Button variant="primary">Upgrade to Pro</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <footer className="py-4 text-white bg-dark">
        <Container className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} QuickPen. All rights reserved.</p>
        </Container>
      </footer>
    </>
  );
};

export default Home;