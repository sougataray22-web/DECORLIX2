import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { CheckCircle, XCircle, Package, ArrowRight, Home } from 'lucide-react';

export default function OrderConfirmPage() {
  const [params] = useSearchParams();
  const orderId  = params.get('order_id');
  const [status, setStatus] = useState('loading');
  const [order,  setOrder]  = useState(null);

  useEffect(() => {
    if (!orderId) return setStatus('failed');
    api.get(`/payment/verify/${orderId}`)
      .then(r => { setStatus(r.data.paid ? 'paid' : 'failed'); setOrder(r.data.order); })
      .catch(()  => setStatus('failed'));
  }, [orderId]);

  return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", padding:'24px' }}>
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {status === 'loading' && (
        <div style={{ textAlign:'center' }}>
          <div style={{ width:'56px', height:'56px', border:'4px solid rgba(245,166,35,0.15)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 20px' }} />
          <p style={{ color:'#686868', fontSize:'15px' }}>Verifying your payment…</p>
        </div>
      )}

      {status === 'paid' && (
        <div style={{ textAlign:'center', maxWidth:'440px', width:'100%' }}>
          <div style={{ animation:'scaleIn .5s cubic-bezier(.16,1,.3,1) forwards', marginBottom:'24px' }}>
            <div style={{ width:'88px', height:'88px', borderRadius:'50%', background:'rgba(45,216,122,0.1)', border:'2px solid rgba(45,216,122,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
              <CheckCircle size={44} color="#2DD87A" />
            </div>
          </div>

          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'32px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.04em', marginBottom:'10px' }}>Order Confirmed!</h1>
          <p style={{ color:'#686868', fontSize:'15px', lineHeight:'1.6', marginBottom:'28px' }}>
            Your order <span style={{ color:'#F5A623', fontWeight:'700', fontFamily:"'Syne',sans-serif" }}>{order?.orderNumber}</span> has been placed successfully. You'll receive updates via email.
          </p>

          {order && (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'20px', marginBottom:'28px', textAlign:'left' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ color:'#686868', fontSize:'13px' }}>Order Total</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', color:'#F5A623', fontSize:'18px' }}>₹{order?.grandTotal?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                <span style={{ color:'#686868', fontSize:'13px' }}>Items</span>
                <span style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500' }}>{order?.subOrders?.reduce((s,sub) => s + sub.items.length, 0)} items from {order?.subOrders?.length} vendor(s)</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:'#686868', fontSize:'13px' }}>Payment</span>
                <span style={{ color:'#2DD87A', fontSize:'12px', fontWeight:'700', background:'rgba(45,216,122,0.1)', border:'1px solid rgba(45,216,122,0.2)', borderRadius:'6px', padding:'2px 8px' }}>PAID</span>
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
            <Link to={`/orders/${orderId}`}
              style={{ display:'flex', alignItems:'center', gap:'8px', background:'#F5A623', color:'#080808', padding:'12px 22px', borderRadius:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>
              <Package size={16} /> Track Order
            </Link>
            <Link to="/"
              style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#A0A0A0', padding:'12px 22px', borderRadius:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'600', fontSize:'14px', textDecoration:'none' }}>
              <Home size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div style={{ textAlign:'center', maxWidth:'400px' }}>
          <div style={{ width:'88px', height:'88px', borderRadius:'50%', background:'rgba(255,77,77,0.1)', border:'2px solid rgba(255,77,77,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
            <XCircle size={44} color="#FF4D4D" />
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'28px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.04em', marginBottom:'10px' }}>Payment Failed</h1>
          <p style={{ color:'#686868', fontSize:'14px', lineHeight:'1.6', marginBottom:'28px' }}>
            Your payment could not be processed. No money has been deducted. Please try again.
          </p>
          <Link to="/cart"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#F5A623', color:'#080808', padding:'13px 28px', borderRadius:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', textDecoration:'none' }}>
            Back to Cart <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
