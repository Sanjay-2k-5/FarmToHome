import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import api from '../../services/api';

const ReportsPanel = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [reportType, setReportType] = useState('sales');
  const [reportData, setReportData] = useState([]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/reports?range=${range}`);
      setReports(data);
      setReportData(data[reportType] || []);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [range, reportType]);

  const renderChart = () => {
    if (!reportData.length) return null;

    // Simple bar chart implementation
    const maxValue = Math.max(...reportData.map(item => item.value || 0));
    const chartHeight = 200;
    const barWidth = 60;
    const gap = 20;
    const chartWidth = (barWidth + gap) * reportData.length + gap;

    return (
      <div className="mt-4">
        <div className="d-flex align-items-end" style={{ height: chartHeight, position: 'relative' }}>
          {reportData.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * (chartHeight - 40) : 0;
            return (
              <div 
                key={index}
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: '#0d6efd',
                  marginRight: gap,
                  position: 'relative',
                  borderRadius: '4px 4px 0 0',
                }}
                title={`${item.label}: ${item.value}`}
              >
                <div 
                  style={{
                    position: 'absolute',
                    bottom: -25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                  }}
                >
                  {item.label}
                </div>
                <div 
                  style={{
                    position: 'absolute',
                    top: -25,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                  }}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReportTable = () => {
    if (!reportData.length) return <div className="text-muted text-center py-4">No data available</div>;

    return (
      <div className="table-responsive mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th className="text-end">Value</th>
              {reportType === 'sales' && <th className="text-end">Orders</th>}
              {reportType === 'users' && <th>New Users</th>}
              {reportType === 'products' && <th>Top Product</th>}
            </tr>
          </thead>
          <tbody>
            {reportData.map((item, index) => (
              <tr key={index}>
                <td>{item.label}</td>
                <td className="text-end">{item.value}</td>
                {reportType === 'sales' && <td className="text-end">{item.orders || 0}</td>}
                {reportType === 'users' && <td>{item.newUsers || 0}</td>}
                {reportType === 'products' && <td>{item.topProduct || 'N/A'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Card.Title>Reports</Card.Title>
          <div className="d-flex">
            <Form.Select 
              className="me-2" 
              style={{ width: '150px' }}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sales">Sales</option>
              <option value="users">Users</option>
              <option value="products">Products</option>
            </Form.Select>
            <Form.Select 
              style={{ width: '140px' }}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </Form.Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            {renderChart()}
            {renderReportTable()}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReportsPanel;
