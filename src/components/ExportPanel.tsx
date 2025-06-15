import React from 'react';
import { Form, Button, Row, Col, Badge } from 'react-bootstrap';

interface ExportPanelProps {
  onCancel: () => void;
  onExport: () => void;
  onSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allVisibleSprintsSelected: boolean;
  selectedCount: number;
  totalCount: number;
  disabled: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  onCancel,
  onExport,
  onSelectAllChange,
  allVisibleSprintsSelected,
  selectedCount,
  totalCount,
  disabled,
}) => {
  return (
    <div className="p-3 border-bottom">
      <Row className="align-items-center g-3">
        <Col xs="auto">
          <Form.Check
            type="checkbox"
            id="select-all-sprints-checkbox"
            label="Select All (Visible)"
            checked={allVisibleSprintsSelected}
            onChange={onSelectAllChange}
            disabled={disabled || totalCount === 0}
            className="fw-bold"
          />
        </Col>
        <Col>
          <Badge pill bg="accent2" className="p-2 fs-6">
            {selectedCount} / {totalCount} selected
          </Badge>
        </Col>
        <Col xs="auto" className="ms-auto">
          <Button
            variant="danger"
            size="sm"
            onClick={onCancel}
            className="me-2"
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={onExport}
            disabled={selectedCount === 0}
          >
            Export Selected (.txt)
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ExportPanel;