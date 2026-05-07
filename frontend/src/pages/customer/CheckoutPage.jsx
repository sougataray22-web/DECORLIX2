import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import useCartStore from '../../context/cartStore';
import useAuthStore from '../../context/authStore';
import { MapPin, CreditCard, ArrowRight, Plus, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [addresses,    setAddresses]    = useState(user?.addresses || []);
  const [selectedAddr, setSelectedAddr] = useState(0);
  const [showNewAddr,  setShowNewAddr]  = useState(!user?.addresses?.length);
  const [addr, setAddr]  = useState({ label:'Home', name:user?.name||'', phone:user?.phone||'', line1:'', line2:'', city:'', state:'', pincode:'' });
  const [placing, setPlacing] = useState(false);

  useEffect(() => { if (!items.length) navigate('/cart'); }, [items]);

  const shipping = total() >= 499 ? 0 : 49;
  const tax      = Math.round(total() * 0.18);
  const grand    = total() + shipping + tax;

  const handlePlace = async () => {
    const shipAddr = showNewAddr ? addr : addresses[selectedAddr];
    if (!shipAddr?.name || !shipAddr?.phone || !shipAddr?.line1 || !shipAddr?.city || !shipAddr?.pincode)
      return toast.error('Fill all address fields');
    setPlacing(true);
    try {
      const orderRes = await api.post('/orders', {
        items: items.map(i => ({ productId:i.productId, variationSku:i.variationSku||undefined, quantity:i.quantity })),
        shippingAddress: shipAddr,
      });
      const sessionRes = await api.post('/payment/create-session', { orderId: orderRes.data.order._id });
      const { load }  = await import('@cashfreepayments/cashfree-js');
      const cashfree  = await load({ mode: process.env.REACT_APP_CASHFREE_MODE || 'production' });
      cashfree.checkout({ paymentSessionId: sessionRes.data.paymentSessionId, redirectTarget:'_self' });
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
      setPlacing(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .addr-card{background:#111;border:2px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px;cursor:pointer;transition:all .18s}
        .addr-card.sel{border-color:#F5A623;background:rgba(245,166,35,0.04)}
        .addr-card:hover{border-color:rgba(255,255,255,0.14)}
        .inp2{width:100%;background:#141414;border:1px solid rgba(255,255,255,0.08);color:#F0F0F0;border-radius:11px;padding:12px 14px;font-size:14px;font-family:'Outfit',sans-serif;outline:none;transition:border-color .18s}
        .inp2:focus{border-color:#F5A623}
        .inp2::placeholder{color:#363636}
        .sum-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:14px}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 24px', background:'rgba(8,8,8,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.025em', margin:0 }}>Checkout</h1>
        </div>
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'28px 24px', display:'grid', gridTemplateColumns:'1fr 320px', gap:'20px', alignItems:'start' }}>

        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Shipping address */}
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'16px', fontWeight:'800', color:'#F0F0F0', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px', letterSpacing:'-0.02em' }}>
              <MapPin size={16} color="#F5A623" /> Delivery Address
            </h2>

            {addresses.length > 0 && !showNewAddr && (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
                  {addresses.map((a, i) => (
                    <label key={i} className={`addr-card${selectedAddr===i?' sel':''}`} onClick={() => setSelectedAddr(i)}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                        <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:`2px solid ${selectedAddr===i?'#F5A623':'rgba(255,255,255,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px', background: selectedAddr===i?'#F5A623':'transparent', transition:'all .18s' }}>
                          {selectedAddr===i && <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#080808' }} />}
                        </div>
                        <div>
                          <p style={{ fontWeight:'600', color:'#E0E0E0', fontSize:'14px', marginBottom:'3px' }}>{a.name} · {a.phone}</p>
                          <p style={{ color:'#686868', fontSize:'13px' }}>{a.line1}{a.line2?`, ${a.line2}`:''}, {a.city}, {a.state} – {a.pincode}</p>
                          <span style={{ fontSize:'11px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'6px', padding:'2px 8px', color:'#686868', marginTop:'6px', display:'inline-block' }}>{a.label}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <button onClick={() => setShowNewAddr(true)} style={{ background:'transparent', border:'1px dashed rgba(255,255,255,0.12)', borderRadius:'12px', padding:'10px 16px', color:'#686868', fontSize:'13px', fontWeight:'500', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', width:'100%', fontFamily:"'Outfit',sans-serif", transition:'all .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(245,166,35,0.4)'; e.currentTarget.style.color='#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='#686868'; }}>
                  <Plus size={14} /> Add New Address
                </button>
              </>
            )}

            {showNewAddr && (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {addresses.length > 0 && (
                  <button onClick={() => setShowNewAddr(false)} style={{ background:'none', border:'none', color:'#686868', fontSize:'13px', cursor:'pointer', textAlign:'left', padding:0, fontFamily:"'Outfit',sans-serif", marginBottom:'4px' }}>
                    ← Use saved address
                  </button>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'12px', color:'#686868', marginBottom:'6px', fontWeight:'500', letterSpacing:'.03em' }}>Label</label>
                    <input className="inp2" value={addr.label} onChange={e=>setAddr({...addr,label:e.target.value})} placeholder="Home / Office" />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'12px', color:'#686868', marginBottom:'6px', fontWeight:'500', letterSpacing:'.03em' }}>Full Name *</label>
                    <input className="inp2" value={addr.name} onChange={e=>setAddr({...addr,name:e.target.value})} placeholder="Receiver name" />
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'#686868', marginBottom:'6px', fontWeight:'500' }}>Phone *</label>
                  <input className="inp2" value={addr.phone} onChange={e=>setAddr({...addr,phone:e.target.value})} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'#686868', marginBottom:'6px', fontWeight:'500' }}>Address Line 1 *</label>
                  <input className="inp2" value={addr.line1} onChange={e=>setAddr({...addr,line1:e.target.value})} placeholder="House/Flat No., Street" />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'#686868', marginBottom:'6px', fontWeight:'500' }}>Address Line 2</label>
                  <input className="inp2" value={addr.line2} onChange={e=>setAddr({...addr,line2:e.target.value})} placeholder="Landmark, Area (optional)" />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                  {[['City','city'],['State','state'],['Pincode','pincode']].map(([lbl,key]) => (
                    <div key={key}>
                      <label style={{ display:'block', fontSize:'12px', color:'#686868', marginBottom:'6px', fontWeight:'500' }}>{lbl} *</label>
                      <input className="inp2" value={addr[key]} onChange={e=>setAddr({...addr,[key]:e.target.value})} placeholder={lbl} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Items preview */}
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'16px', fontWeight:'800', color:'#F0F0F0', marginBottom:'16px', letterSpacing:'-0.02em' }}>
              Items ({items.length})
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {items.map(item => (
                <div key={item.key} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <img src={item.image} alt={item.name} style={{ width:'52px', height:'52px', borderRadius:'10px', objectFit:'cover', background:'#1a1a1a', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="line-clamp-1" style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{item.name}</p>
                    <p style={{ color:'#505050', fontSize:'12px' }}>Qty: {item.quantity}</p>
                  </div>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', color:'#F5A623', fontSize:'14px', flexShrink:0 }}>₹{(item.unitPrice*item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px', position:'sticky', top:'76px' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'16px', fontWeight:'800', color:'#F0F0F0', marginBottom:'18px', display:'flex', alignItems:'center', gap:'8px', letterSpacing:'-0.02em' }}>
            <CreditCard size={16} color="#F5A623" /> Payment Summary
          </h2>

          <div className="sum-row"><span style={{ color:'#686868' }}>Items Total</span><span style={{ color:'#A0A0A0' }}>₹{total().toLocaleString('en-IN')}</span></div>
          <div className="sum-row"><span style={{ color:'#686868' }}>Shipping</span><span style={{ color: shipping===0?'#2DD87A':'#A0A0A0' }}>{shipping===0?'FREE':`₹${shipping}`}</span></div>
          <div className="sum-row"><span style={{ color:'#686868' }}>GST (18%)</span><span style={{ color:'#A0A0A0' }}>₹{tax.toLocaleString('en-IN')}</span></div>

          <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'12px 0 16px' }} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', color:'#F0F0F0' }}>Total Payable</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'24px', color:'#F5A623', letterSpacing:'-0.04em' }}>₹{grand.toLocaleString('en-IN')}</span>
          </div>

          <button onClick={handlePlace} disabled={placing}
            style={{ width:'100%', background: placing?'#1a1a1a':'#F5A623', color: placing?'#505050':'#080808', border:'none', borderRadius:'12px', padding:'15px', fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', cursor: placing?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s' }}>
            {placing ? 'Redirecting to payment…' : <>Pay ₹{grand.toLocaleString('en-IN')} <ArrowRight size={16} /></>}
          </button>

          <p style={{ textAlign:'center', color:'#363636', fontSize:'12px', marginTop:'14px' }}>🔒 Powered by Cashfree · PCI-DSS Compliant</p>
        </div>
      </div>
    </div>
  );
}
