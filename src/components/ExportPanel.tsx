import React from 'react';
import { Form, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';

interface ExportPanelProps {
  onCancel: () => void;
  onExportTxt: () => void;
  onExportPdf: () => void;
  onSelectAllChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allVisibleSprintsSelected: boolean;
  selectedCount: number;
  totalCount: number;
  disabled: boolean;
  exportingPdf?: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  onCancel,
  onExportTxt,
  onExportPdf,
  onSelectAllChange,
  allVisibleSprintsSelected,
  selectedCount,
  totalCount,
  disabled,
  exportingPdf = false,
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
            variant="outline-danger"
            size="sm"
            onClick={onCancel}
            className="me-2"
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={onExportTxt}
            disabled={disabled || selectedCount === 0}
            className="me-2"
          >
            <i className="bi bi-file-earmark-text me-1"></i>
            .txt
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={onExportPdf}
            disabled={disabled || selectedCount === 0}
          >
            {exportingPdf ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Generating...
              </>
            ) : (
              <>
                <i className="bi bi-filetype-pdf me-1"></i>
                .pdf
              </>
            )}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ExportPanel;