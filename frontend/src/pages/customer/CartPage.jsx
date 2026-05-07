import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../context/cartStore';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, Tag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQty, total, itemCount } = useCartStore();
  const navigate = useNavigate();
  const shipping = total() >= 499 ? 0 : 49;
  const tax      = Math.round(total() * 0.18);
  const grand    = total() + shipping + tax;

  if (items.length === 0) return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", padding:'24px' }}>
      <div style={{ width:'80px', height:'80px', borderRadius:'20px', background:'#111', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'20px' }}>
        <ShoppingCart size={32} color="#363636" />
      </div>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'24px', fontWeight:'800', color:'#F0F0F0', marginBottom:'8px', letterSpacing:'-0.03em' }}>Your cart is empty</h2>
      <p style={{ color:'#686868', fontSize:'14px', marginBottom:'28px' }}>Add some products to get started</p>
      <Link to="/" style={{ background:'#F5A623', color:'#080808', padding:'12px 28px', borderRadius:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', textDecoration:'none', display:'flex', alignItems:'center', gap:'8px' }}>
        Shop Now <ArrowRight size={15} />
      </Link>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .cart-item{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;transition:border-color .18s}
        .cart-item:hover{border-color:rgba(255,255,255,0.12)}
        .qty-btn{width:30px;height:30px;border-radius:8px;border:none;background:rgba(255,255,255,0.05);color:#A0A0A0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .qty-btn:hover{background:rgba(255,255,255,0.1);color:#F0F0F0}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 24px', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', gap:'16px' }}>
          <Link to="/" style={{ color:'#686868', textDecoration:'none', display:'flex', alignItems:'center' }}>
            <ArrowRight size={18} style={{ transform:'rotate(180deg)' }} />
          </Link>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.025em', margin:0 }}>
            Cart <span style={{ color:'#686868', fontWeight:'500', fontSize:'16px' }}>({itemCount()} items)</span>
          </h1>
        </div>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'24px', display:'grid', gridTemplateColumns:'1fr 340px', gap:'20px', alignItems:'start' }}>

        {/* Items */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {items.map(item => (
            <div key={item.key} className="cart-item">
              <img src={item.image} alt={item.name} style={{ width:'70px', height:'70px', borderRadius:'12px', objectFit:'cover', background:'#1a1a1a', flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <Link to={`/products/${item.slug}`} style={{ textDecoration:'none' }}>
                  <p className="line-clamp-2" style={{ color:'#E0E0E0', fontSize:'14px', fontWeight:'500', marginBottom:'4px', lineHeight:'1.4' }}>{item.name}</p>
                </Link>
                <p style={{ color:'#505050', fontSize:'12px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
                  <Store size={11} /> {item.vendorName}
                </p>
                {item.variationSku && Object.entries(item.attributes||{}).map(([k,v]) => (
                  <span key={k} style={{ fontSize:'11px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'6px', padding:'2px 8px', color:'#686868', marginRight:'6px' }}>{k}: {v}</span>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px' }}>
                <button onClick={() => removeItem(item.key)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#404040', padding:'4px', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color='#FF4D4D'} onMouseLeave={e=>e.currentTarget.style.color='#404040'}>
                  <Trash2 size={15} />
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'4px' }}>
                  <button className="qty-btn" onClick={() => updateQty(item.key, item.quantity-1)}><Minus size={12} /></button>
                  <span style={{ width:'28px', textAlign:'center', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', color:'#F0F0F0' }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.key, item.quantity+1)}><Plus size={12} /></button>
                </div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'15px', color:'#F5A623' }}>
                  ₹{(item.unitPrice*item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px', position:'sticky', top:'76px' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'16px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.025em', marginBottom:'20px' }}>Order Summary</h2>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
            {[
              { label:'Subtotal', value:`₹${total().toLocaleString('en-IN')}` },
              { label:'Shipping', value: shipping===0?'FREE':`₹${shipping}`, color: shipping===0?'#2DD87A':'#A0A0A0' },
              { label:'GST (18%)', value:`₹${tax.toLocaleString('en-IN')}` },
            ].map(({ label, value, color='#A0A0A0' }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'#686868', fontSize:'14px' }}>{label}</span>
                <span style={{ color, fontSize:'14px', fontWeight:'500' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'0 0 16px' }} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', color:'#F0F0F0' }}>Total</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'22px', color:'#F5A623', letterSpacing:'-0.03em' }}>₹{grand.toLocaleString('en-IN')}</span>
          </div>

          {shipping === 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(45,216,122,0.07)', border:'1px solid rgba(45,216,122,0.18)', borderRadius:'10px', padding:'10px 12px', marginBottom:'14px' }}>
              <Tag size={13} color="#2DD87A" />
              <span style={{ color:'#2DD87A', fontSize:'12px', fontWeight:'600' }}>You qualify for free delivery!</span>
            </div>
          )}

          <button onClick={() => navigate('/checkout')}
            style={{ width:'100%', background:'#F5A623', color:'#080808', border:'none', borderRadius:'12px', padding:'14px', fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s', letterSpacing:'.01em' }}
            onMouseEnter={e => { e.currentTarget.style.background='#F7B740'; e.currentTarget.style.boxShadow='0 8px 24px rgba(245,166,35,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#F5A623'; e.currentTarget.style.boxShadow='none'; }}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>

          <p style={{ textAlign:'center', color:'#363636', fontSize:'12px', marginTop:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            🔒 Secured by Cashfree Payments
          </p>
        </div>
      </div>
    </div>
  );
}
