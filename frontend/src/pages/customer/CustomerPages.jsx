import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Package, ChevronRight, User, MapPin, ArrowLeft, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

/* ─── OrdersPage ────────────────────────────────────────────────────────────── */
export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders||[])).finally(() => setLoading(false));
  }, []);

  const statusIcon = { delivered:<CheckCircle size={14} color="#2DD87A"/>, shipped:<Truck size={14} color="#4DA6FF"/>, cancelled:<XCircle size={14} color="#FF4D4D"/>, pending:<Clock size={14} color="#F5A623"/>, confirmed:<CheckCircle size={14} color="#A78BFA"/> };
  const statusColor = { delivered:'#2DD87A', shipped:'#4DA6FF', cancelled:'#FF4D4D', pending:'#F5A623', confirmed:'#A78BFA', processing:'#FB923C' };

  return (
    <PageShell title="My Orders" back="/">
      {loading ? <Loader /> : orders.length===0 ? (
        <Empty Icon={Package} msg="No orders yet" sub="Your order history will appear here" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {orders.map(o => (
            <Link key={o._id} to={`/orders/${o._id}`} style={{ textDecoration:'none' }}>
              <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px 18px', transition:'all .18s', display:'flex', alignItems:'center', justifyContent:'space-between' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.13)'; e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='#111'; }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', color:'#F0F0F0' }}>{o.orderNumber}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      {statusIcon[o.status]}
                      <span style={{ fontSize:'12px', color: statusColor[o.status]||'#686868', fontWeight:'600', textTransform:'capitalize' }}>{o.status}</span>
                    </div>
                  </div>
                  <p style={{ color:'#505050', fontSize:'12px', marginBottom:'10px' }}>{new Date(o.createdAt).toLocaleString()}</p>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {o.subOrders?.flatMap(s=>s.items).slice(0,4).map((item,i) => (
                      <img key={i} src={item.image} alt="" style={{ width:'36px', height:'36px', borderRadius:'8px', objectFit:'cover', background:'#1a1a1a' }} />
                    ))}
                    {o.subOrders?.flatMap(s=>s.items).length > 4 && (
                      <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', color:'#686868', fontWeight:'600' }}>
                        +{o.subOrders.flatMap(s=>s.items).length-4}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'18px', color:'#F5A623', letterSpacing:'-0.03em' }}>₹{o.grandTotal?.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize:'11px', color:'#505050', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'6px', padding:'2px 8px' }}>{o.paymentStatus}</span>
                  <ChevronRight size={14} color="#505050" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* ─── OrderDetailPage ───────────────────────────────────────────────────────── */
export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageShell title="Order Details" back="/orders"><Loader /></PageShell>;
  if (!order)  return <PageShell title="Order Details" back="/orders"><Empty Icon={Package} msg="Order not found" /></PageShell>;

  return (
    <PageShell title={order.orderNumber} back="/orders">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px', alignItems:'start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {order.subOrders?.map((sub, si) => (
            <div key={si} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <p style={{ color:'#A0A0A0', fontSize:'13px', fontWeight:'500' }}>Vendor: {sub.vendor?.businessName||sub.vendor?.name}</p>
                <StatusBadge s={sub.status} />
              </div>
              {sub.items.map((item, ii) => (
                <div key={ii} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <img src={item.image} alt={item.name} style={{ width:'50px', height:'50px', borderRadius:'10px', objectFit:'cover', background:'#1a1a1a', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{item.name}</p>
                    <p style={{ color:'#505050', fontSize:'12px' }}>Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString('en-IN')}</p>
                  </div>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', color:'#F5A623', fontSize:'14px' }}>₹{item.totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {sub.trackingNumber && (
                <div style={{ padding:'12px 18px', background:'rgba(77,166,255,0.05)', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ color:'#4DA6FF', fontSize:'12px', fontWeight:'600' }}>🚚 {sub.shippingPartner} · {sub.trackingNumber}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'12px', position:'sticky', top:'80px' }}>
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px' }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'800', color:'#F0F0F0', marginBottom:'14px', letterSpacing:'-0.02em' }}>Payment Details</h3>
            {[['Items', `₹${order.itemsTotal?.toLocaleString('en-IN')}`],['Shipping', order.shippingTotal===0?'FREE':`₹${order.shippingTotal}`],['Tax', `₹${order.taxTotal?.toLocaleString('en-IN')}`]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'13px' }}>
                <span style={{ color:'#686868' }}>{l}</span>
                <span style={{ color:'#A0A0A0' }}>{v}</span>
              </div>
            ))}
            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'10px 0 12px' }} />
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', color:'#F0F0F0', fontSize:'14px' }}>Total</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', color:'#F5A623', fontSize:'18px', letterSpacing:'-0.03em' }}>₹{order.grandTotal?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop:'12px' }}>
              <StatusBadge s={order.paymentStatus} />
            </div>
          </div>

          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px' }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'800', color:'#F0F0F0', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px', letterSpacing:'-0.02em' }}>
              <MapPin size={14} color="#F5A623" /> Delivery Address
            </h3>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'3px' }}>{order.shippingAddress?.name}</p>
            <p style={{ color:'#686868', fontSize:'13px', lineHeight:'1.5' }}>
              {order.shippingAddress?.line1}{order.shippingAddress?.line2?`, ${order.shippingAddress.line2}`:''}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ─── ProfilePage ───────────────────────────────────────────────────────────── */
export function ProfilePage() {
  const [me, setMe] = useState(null);
  useEffect(() => { api.get('/auth/me').then(r => setMe(r.data.user)); }, []);

  return (
    <PageShell title="My Profile" back="/">
      {!me ? <Loader /> : (
        <div style={{ maxWidth:'520px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px', display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ width:'60px', height:'60px', borderRadius:'16px', background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <User size={26} color="#F5A623" />
            </div>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', fontWeight:'800', color:'#F0F0F0', marginBottom:'4px', letterSpacing:'-0.025em' }}>{me.name||'Set your name'}</h2>
              <p style={{ color:'#686868', fontSize:'13px', marginBottom:'6px' }}>{me.email||me.phone}</p>
              <span className="badge badge-amber" style={{ textTransform:'capitalize' }}>{me.role}</span>
            </div>
          </div>

          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px' }}>
            {[['Email', me.email||'—'],['Phone', me.phone||'—'],['Member since', new Date(me.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'14px' }}>
                <span style={{ color:'#686868' }}>{l}</span>
                <span style={{ color:'#E0E0E0', fontWeight:'500' }}>{v}</span>
              </div>
            ))}
          </div>

          <Link to="/orders" style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', textDecoration:'none', transition:'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.13)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', color:'#E0E0E0', fontSize:'14px', fontWeight:'500' }}>
              <Package size={16} color="#F5A623" /> My Orders
            </div>
            <ChevronRight size={16} color="#505050" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}

/* ─── Shared Components ──────────────────────────────────────────────────────── */
function PageShell({ title, back, children }) {
  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 24px', background:'rgba(8,8,8,0.85)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', alignItems:'center', gap:'16px' }}>
          <Link to={back||'/'} style={{ color:'#686868', textDecoration:'none', display:'flex', alignItems:'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'19px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.025em', margin:0 }}>{title}</h1>
        </div>
      </div>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'28px 24px' }}>{children}</div>
    </div>
  );
}

const StatusBadge = ({ s }) => {
  const m = { delivered:'badge-green', shipped:'badge-blue', confirmed:'badge-blue', pending:'badge-amber', cancelled:'badge-red', paid:'badge-green', failed:'badge-red', processing:'badge-amber' };
  return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>;
};

const Loader = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
    <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);

const Empty = ({ Icon, msg, sub }) => (
  <div style={{ textAlign:'center', padding:'60px 0', color:'#363636' }}>
    <Icon size={36} style={{ margin:'0 auto 12px', display:'block', color:'#252525' }} />
    <p style={{ fontSize:'16px', fontWeight:'600', color:'#505050', marginBottom:'6px' }}>{msg}</p>
    {sub && <p style={{ fontSize:'13px' }}>{sub}</p>}
  </div>
);
