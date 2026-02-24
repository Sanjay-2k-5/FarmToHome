import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Container, Table, Button, Form, Card } from 'react-bootstrap';

const CartPage = () => {
  const { items, increment, decrement, updateQty, removeItem, clear, summary } = useCart();
  const navigate = useNavigate();
  const DELIVERY = 29;

  const [localQuantities, setLocalQuantities] = React.useState({});

  // Initialize local quantities when items change
  React.useEffect(() => {
    const initialQuantities = {};
    items.forEach(item => {
      initialQuantities[item._id] = item.qty;
    });
    setLocalQuantities(initialQuantities);
  }, [items]);

  const handleQtyChange = (id, stock) => (e) => {
    const value = e.target.value;
    
    // Update local state immediately for better UX
    setLocalQuantities(prev => ({
      ...prev,
      [id]: value
    }));

    // If the field is empty, don't update the actual quantity yet
    if (value === '') return;

    const v = parseFloat(value);
    if (!Number.isFinite(v) || v <= 0) return;
    
    // Update the actual quantity in the cart
    updateQty(id, v).catch(error => {
      console.error('Error updating quantity:', error);
      // Revert the input if there's an error
      setLocalQuantities(prev => ({
        ...prev,
        [id]: items.find(item => item._id === id)?.qty || 0.5
      }));
    });
  };

  const handleBlur = (id, stock) => (e) => {
    const value = e.target.value;
    let v = parseFloat(value);
    
    // If value is empty or invalid, set to minimum (0.5)
    if (!value || isNaN(v) || v < 0.5) {
      v = 0.5;
      setLocalQuantities(prev => ({
        ...prev,
        [id]: v
      }));
    }
    
    // Ensure we don't exceed stock
    if (stock && v > stock) {
      v = stock;
      setLocalQuantities(prev => ({
        ...prev,
        [id]: v
      }));
    }
    
    // Update the actual quantity in the cart
    updateQty(id, v, stock);
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 960 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
          <Link to="/dashboard" className="btn btn-outline-primary">User Dashboard</Link>
        </div>
        <Link to="/products" className="btn btn-link">Continue Shopping</Link>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Products</Card.Title>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>In Stock</th>
                    <th style={{ width: 180 }}>Quantity (kg)</th>
                    <th className="text-end">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it._id}>
                      <td>{it.name}</td>
                      <td>₹{Number(it.price).toFixed(2)}</td>
                      <td>{Number(it.stock || 0)} kg</td>
                      <td>
                        <div className="d-flex align-items-center" style={{ minHeight: '38px' }}>
                          <Button 
                            size="sm" 
                            variant="outline-secondary" 
                            onClick={async () => await decrement(it._id)}
                            disabled={it.qty <= 0.5}
                          >-</Button>
                          <Form.Control
                            size="sm"
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={localQuantities[it._id] ?? it.qty}
                            onChange={handleQtyChange(it._id, it.stock)}
                            onBlur={handleBlur(it._id, it.stock)}
                            className="mx-2"
                            style={{ width: 100 }}
                          />
                          <Button 
                            size="sm" 
                            variant="outline-secondary" 
                            onClick={async () => await increment(it._id)}
                            disabled={it.qty >= (it.stock || Infinity)}
                          >+</Button>
                        </div>
                      </td>
                      <td className="text-end">₹{(Number(it.price) * it.qty).toFixed(2)}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-danger" onClick={() => removeItem(it._id)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4  style{{color:'black'}}">Your cart is empty</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Bill Details</Card.Title>
            <div className="d-flex justify-content-between">
              <div>Total products</div>
              <div>{summary.distinct}</div>
            </div>
            <div className="d-flex justify-content-between">
              <div>Items total</div>
              <div>₹{summary.total.toFixed(2)}</div>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <div>Delivery charges</div>
              <div>₹{DELIVERY.toFixed(2)}</div>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold mb-3">
              <div>Grand total</div>
              <div>₹{(summary.total + DELIVERY).toFixed(2)}</div>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="outline-secondary" onClick={clear}>Clear Cart</Button>
              <Button className="" disabled={items.length === 0}>Proceed to Pay</Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default CartPage;
