import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaRobot, FaSeedling, FaCalendarAlt, FaChartLine, FaRupeeSign, FaCloudSun, FaThermometerHalf, FaTint } from 'react-icons/fa';
import api from '../../utils/api';
import './PricePredictor.css';

const PricePredictor = () => {
  const [formData, setFormData] = useState({
    cropType: '',
    seedDate: '',
    yieldDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/farmer/predict-price', formData);
      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.message || 'Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="price-predictor-container">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <div className="predictor-card-wrapper shadow">
            <div className="predictor-header px-4 py-4 px-md-5">
              <Row className="align-items-center">
                <Col xs="auto">
                  <div className="icon-wrapper bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <FaRobot size={30} />
                  </div>
                </Col>
                <Col>
                  <h3 className="mb-1 fw-bold text-white">AI Crop Predictor</h3>
                  <p className="mb-0 text-white-50">Market Price & Climate Forecast Tool</p>
                </Col>
              </Row>
            </div>
            
            <div className="predictor-body p-4 p-md-5 bg-white">
              {error && <Alert variant="danger" className="rounded-3 border-0 shadow-sm">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-dark mb-2">
                        <FaSeedling className="me-2 text-success" />
                        Crop Type
                      </Form.Label>
                      <Form.Select
                        name="cropType"
                        value={formData.cropType || ""}
                        onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                        required
                        className="custom-input form-control-lg text-capitalize"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="" disabled>Select a crop, fruit, or vegetable...</option>
                        <optgroup label="Grains & Cereals">
                          <option value="rice">Rice</option>
                          <option value="wheat">Wheat</option>
                          <option value="corn">Corn</option>
                          <option value="barley">Barley</option>
                          <option value="bajra">Bajra</option>
                          <option value="jowar">Jowar</option>
                        </optgroup>
                        <optgroup label="Vegetables">
                          <option value="tomato">Tomato</option>
                          <option value="potato">Potato</option>
                          <option value="onion">Onion</option>
                          <option value="carrot">Carrot</option>
                          <option value="cabbage">Cabbage</option>
                          <option value="spinach">Spinach</option>
                          <option value="brinjal">Brinjal (Eggplant)</option>
                          <option value="cauliflower">Cauliflower</option>
                          <option value="pumpkin">Pumpkin</option>
                          <option value="cucumber">Cucumber</option>
                        </optgroup>
                        <optgroup label="Fruits">
                          <option value="apple">Apple</option>
                          <option value="banana">Banana</option>
                          <option value="mango">Mango</option>
                          <option value="grapes">Grapes</option>
                          <option value="orange">Orange</option>
                          <option value="watermelon">Watermelon</option>
                          <option value="papaya">Papaya</option>
                          <option value="guava">Guava</option>
                          <option value="pomegranate">Pomegranate</option>
                          <option value="lemon">Lemon</option>
                          <option value="coconut">Coconut</option>
                        </optgroup>
                        <optgroup label="Spices & Herbs">
                          <option value="garlic">Garlic</option>
                          <option value="ginger">Ginger</option>
                          <option value="turmeric">Turmeric</option>
                          <option value="chilli">Chilli</option>
                          <option value="coriander">Coriander</option>
                          <option value="cumin">Cumin</option>
                          <option value="black pepper">Black Pepper</option>
                          <option value="cardamom">Cardamom</option>
                          <option value="clove">Clove</option>
                          <option value="nutmeg">Nutmeg</option>
                        </optgroup>
                        <optgroup label="Legumes & Nuts">
                          <option value="dal">Dal (Lentils)</option>
                          <option value="soybean">Soybean</option>
                          <option value="chickpea">Chickpea</option>
                          <option value="peanut">Peanut</option>
                          <option value="cashew">Cashew</option>
                          <option value="almond">Almond</option>
                          <option value="walnut">Walnut</option>
                          <option value="pistachio">Pistachio</option>
                        </optgroup>
                        <optgroup label="Cash Crops">
                          <option value="sugarcane">Sugarcane</option>
                          <option value="cotton">Cotton</option>
                          <option value="mustard">Mustard</option>
                          <option value="coffee">Coffee</option>
                          <option value="tea">Tea</option>
                          <option value="rubber">Rubber</option>
                          <option value="jute">Jute</option>
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-dark mb-2">
                        <FaCalendarAlt className="me-2 text-primary" />
                        Seeding Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="seedDate"
                        value={formData.seedDate}
                        onChange={handleChange}
                        required
                        className="custom-input form-control-lg"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold text-dark mb-2">
                        <FaCalendarAlt className="me-2 text-danger" />
                        Expected Yield Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="yieldDate"
                        value={formData.yieldDate}
                        onChange={handleChange}
                        required
                        className="custom-input form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-5">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    disabled={loading || !formData.cropType || !formData.seedDate || !formData.yieldDate}
                    className="predict-btn px-5"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Analyzing Data...
                      </>
                    ) : (
                      <>
                        <FaChartLine className="me-2" /> Generate Forecast
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {result && (
                <div className="result-section mt-5 pt-3 animation-fade-in">
                  <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom">Forecast Results</h4>
                  
                  <Row className="g-4">
                    <Col md={6}>
                      <Card className="result-card price-card h-100 border-0 shadow-sm">
                        <Card.Body className="p-4 relative">
                          <Badge bg="success" className="mb-3 rounded-pill px-3 py-2 fs-6 shadow-sm">
                            <FaRupeeSign className="me-1" /> Best Price
                          </Badge>
                          <div className="text-muted mb-1 fs-6 fw-semibold">Estimated Market Value</div>
                          <div className="display-5 fw-bold text-dark mb-2">
                            ₹{result.predictedPrice}
                            <span className="fs-5 text-muted ms-2">{result.unit}</span>
                          </div>
                          
                          <div className="confidence-meter mt-4 p-3 bg-light rounded-3">
                            <div className="d-flex justify-content-between mb-2">
                              <span className="fw-bold text-secondary fs-sm">AI Confidence</span>
                              <span className="fw-bold text-success">{result.confidenceScore}%</span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar custom-progress-bar" 
                                role="progressbar" 
                                style={{ width: `${result.confidenceScore}%` }} 
                              />
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="result-card climate-card h-100 border-0 shadow-sm">
                        <Card.Body className="p-4">
                          <Badge bg="info" className="mb-3 rounded-pill px-3 py-2 fs-6 shadow-sm">
                            <FaCloudSun className="me-1" /> Season Climate
                          </Badge>
                          <h5 className="fw-bold text-dark mb-3 mt-1">
                            {result.expectedClimate}
                          </h5>
                          
                          <div className="climate-details mt-4">
                            <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                              <div className="icon-box bg-white text-danger shadow-sm me-3">
                                <FaThermometerHalf size={20} />
                              </div>
                              <div>
                                <div className="text-muted fs-sm fw-semibold">Temperature</div>
                                <div className="fw-bold text-dark">{result.temperatureRange}</div>
                              </div>
                            </div>
                            
                            <div className="d-flex align-items-center p-3 bg-light rounded-3">
                              <div className="icon-box bg-white text-primary shadow-sm me-3">
                                <FaTint size={20} />
                              </div>
                              <div>
                                <div className="text-muted fs-sm fw-semibold">Rainfall Prob.</div>
                                <div className="fw-bold text-dark">{result.rainfallProbability}</div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PricePredictor;
