import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Package, LayoutDashboard, LogOut, Store, ChevronDown, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const NAV = [
  { label:'Dashboard', to:'/vendor/dashboard', Icon:LayoutDashboard },
  { label:'Products',  to:'/vendor/products',  Icon:Package },
  { label:'Orders',    to:'/vendor/orders',    Icon:ShoppingCart },
];

const STATUS_OPTIONS = ['confirmed','processing','shipped','delivered','cancelled'];

const statusConfig = {
  pending:    { color:'#F5A623', bg:'rgba(245,166,35,0.08)',  border:'rgba(245,166,35,0.2)',  Icon:Clock },
  confirmed:  { color:'#A78BFA', bg:'rgba(167,139,250,0.08)', border:'rgba(167,139,250,0.2)', Icon:CheckCircle },
  processing: { color:'#FB923C', bg:'rgba(251,146,60,0.08)',  border:'rgba(251,146,60,0.2)',  Icon:AlertCircle },
  shipped:    { color:'#4DA6FF', bg:'rgba(77,166,255,0.08)',  border:'rgba(77,166,255,0.2)',  Icon:Truck },
  delivered:  { color:'#2DD87A', bg:'rgba(45,216,122,0.08)', border:'rgba(45,216,122,0.2)',  Icon:CheckCircle },
  cancelled:  { color:'#FF4D4D', bg:'rgba(255,77,77,0.08)',  border:'rgba(255,77,77,0.2)',   Icon:XCircle },
};

export default function VendorOrders() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter,   setFilter]   = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/orders').then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, subId, status) => {
    setUpdating(`${orderId}-${subId}`);
    try {
      await api.patch(`/orders/${orderId}/sub/${subId}`, { status });
      toast.success(`Status updated to ${status}`);
      setOrders(prev => prev.map(o => ({
        ...o,
        subOrders: o.subOrders?.map(s =>
          s._id === subId ? { ...s, status } : s
        ),
      })));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const vendorSubOrders = orders.flatMap(o =>
    (o.subOrders || [])
      .filter(s => s.vendor === user?._id || s.vendor?._id === user?._id || true)
      .map(s => ({ ...s, order: o }))
  );

  const filtered = filter === 'all' ? vendorSubOrders : vendorSubOrders.filter(s => s.status === filter);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .vnd-sb5{width:210px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.vnd-sb5{display:none}}
        .vnd-nav5{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .vnd-nav5:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .vnd-nav5.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .order-card{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;transition:border-color .18s;margin-bottom:12px}
        .order-card:hover{border-color:rgba(255,255,255,0.12)}
        .status-select{appearance:none;background:#141414;border:1px solid rgba(255,255,255,0.1);color:#E0E0E0;border-radius:9px;padding:8px 32px 8px 12px;font-size:12px;font-family:'Syne',sans-serif;font-weight:700;cursor:pointer;outline:none;transition:border-color .18s;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23686868' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
        .status-select:focus{border-color:#F5A623}
        .item-row{display:flex;align-items:center;gap:12px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.04)}
        .item-row:last-child{border-bottom:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Sidebar */}
      <aside className="vnd-sb5">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'2px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Store size={15} color="#080808" />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'13px', color:'#F0F0F0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px' }}>
              {user?.businessName || 'My Store'}
            </span>
          </div>
          <span style={{ fontSize:'11px', color:'#2DD87A', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>VENDOR</span>
        </div>

        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`vnd-nav5${location.pathname === to ? ' active' : ''}`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="vnd-nav5" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:'auto' }}>
        {/* Top bar */}
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <ShoppingCart size={16} color="#F5A623" />
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0 }}>Orders</h1>
            <span style={{ color:'#686868', fontSize:'13px' }}>({filtered.length})</span>
          </div>
        </div>

        <div style={{ padding:'24px 28px', maxWidth:'960px' }}>

          {/* Filter tabs */}
          <div style={{ display:'flex', gap:'6px', marginBottom:'22px', flexWrap:'wrap' }}>
            {['all', ...STATUS_OPTIONS].map(s => {
              const cfg = statusConfig[s];
              return (
                <button key={s} onClick={() => setFilter(s)}
                  style={{
                    padding:'7px 16px', borderRadius:'9px', border:'none', cursor:'pointer',
                    fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'12px',
                    textTransform:'capitalize', transition:'all .18s',
                    background: filter === s
                      ? (cfg ? cfg.bg : 'rgba(255,255,255,0.08)')
                      : 'rgba(255,255,255,0.03)',
                    color: filter === s
                      ? (cfg ? cfg.color : '#F0F0F0')
                      : '#686868',
                    outline: filter !== s ? '1px solid rgba(255,255,255,0.07)' : `1px solid ${cfg?.border || 'rgba(255,255,255,0.15)'}`,
                  }}>
                  {s === 'all' ? 'All Orders' : s}
                </button>
              );
            })}
          </div>

          {/* Orders list */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'250px' }}>
              <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'70px 0', color:'#363636' }}>
              <ShoppingCart size={40} style={{ margin:'0 auto 14px', display:'block', color:'#252525' }} />
              <p style={{ fontSize:'16px', color:'#505050', fontWeight:'600', marginBottom:'6px' }}>No orders yet</p>
              <p style={{ fontSize:'13px' }}>Orders will appear here once customers purchase your products</p>
            </div>
          ) : (
            filtered.map(sub => {
              const cfg = statusConfig[sub.status] || statusConfig.pending;
              const StatusIcon = cfg.Icon;
              const isExpanded = expanded === sub._id;
              const isUpdating = updating === `${sub.order._id}-${sub._id}`;

              return (
                <div key={sub._id} className="order-card">
                  {/* Order header */}
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
                    onClick={() => setExpanded(isExpanded ? null : sub._id)}>
                    <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                      {/* Status icon */}
                      <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <StatusIcon size={18} color={cfg.color} />
                      </div>

                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', color:'#F0F0F0' }}>
                            {sub.order.orderNumber}
                          </span>
                          <span style={{ fontSize:'11px', color:cfg.color, fontWeight:'700', background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:'6px', padding:'2px 8px', textTransform:'capitalize' }}>
                            {sub.status}
                          </span>
                        </div>
                        <p style={{ color:'#505050', fontSize:'12px', margin:0 }}>
                          {sub.items?.length || 0} item(s) · {new Date(sub.order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'18px', color:'#F5A623', letterSpacing:'-0.03em', margin:0 }}>
                          ₹{sub.subtotal?.toLocaleString('en-IN')}
                        </p>
                        <p style={{ color: sub.order.paymentStatus === 'paid' ? '#2DD87A' : '#F5A623', fontSize:'11px', fontWeight:'700', margin:0 }}>
                          {sub.order.paymentStatus?.toUpperCase()}
                        </p>
                      </div>
                      <ChevronDown size={16} color="#505050" style={{ transition:'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                      {/* Items */}
                      {sub.items?.map((item, i) => (
                        <div key={i} className="item-row">
                          <img src={item.image} alt={item.name} style={{ width:'44px', height:'44px', borderRadius:'9px', objectFit:'cover', background:'#1a1a1a', flexShrink:0 }} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <p className="line-clamp-1" style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{item.name}</p>
                            <p style={{ color:'#505050', fontSize:'12px' }}>Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString('en-IN')}</p>
                          </div>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', color:'#F5A623', fontSize:'14px', flexShrink:0 }}>
                            ₹{item.totalPrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}

                      {/* Shipping address */}
                      <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.04)', background:'rgba(255,255,255,0.01)' }}>
                        <p style={{ color:'#505050', fontSize:'11px', fontWeight:'700', letterSpacing:'.04em', textTransform:'uppercase', marginBottom:'6px' }}>Delivery Address</p>
                        <p style={{ color:'#A0A0A0', fontSize:'13px', lineHeight:'1.5' }}>
                          {sub.order.shippingAddress?.name} · {sub.order.shippingAddress?.phone}<br />
                          {sub.order.shippingAddress?.line1}{sub.order.shippingAddress?.line2 ? `, ${sub.order.shippingAddress.line2}` : ''}<br />
                          {sub.order.shippingAddress?.city}, {sub.order.shippingAddress?.state} – {sub.order.shippingAddress?.pincode}
                        </p>
                      </div>

                      {/* Tracking info */}
                      {sub.trackingNumber && (
                        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:'8px', background:'rgba(77,166,255,0.04)' }}>
                          <Truck size={14} color="#4DA6FF" />
                          <span style={{ color:'#4DA6FF', fontSize:'13px', fontWeight:'600' }}>
                            {sub.shippingPartner && `${sub.shippingPartner} · `}{sub.trackingNumber}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      {!['delivered','cancelled'].includes(sub.status) && (
                        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                          <p style={{ color:'#686868', fontSize:'13px', fontWeight:'500', margin:0 }}>Update status:</p>
                          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                            {STATUS_OPTIONS.filter(s => {
                              const order = ['pending','confirmed','processing','shipped','delivered','cancelled'];
                              const currentIdx = order.indexOf(sub.status);
                              const sIdx = order.indexOf(s);
                              if (s === 'cancelled') return sub.status !== 'delivered';
                              return sIdx > currentIdx && sIdx <= currentIdx + 1;
                            }).map(s => {
                              const sCfg = statusConfig[s];
                              return (
                                <button key={s} onClick={() => updateStatus(sub.order._id, sub._id, s)}
                                  disabled={isUpdating}
                                  style={{
                                    padding:'8px 16px', borderRadius:'9px', fontFamily:"'Syne',sans-serif",
                                    fontWeight:'700', fontSize:'12px', cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    transition:'all .18s', textTransform:'capitalize', border:'none',
                                    background: s === 'cancelled' ? 'rgba(255,77,77,0.1)' : sCfg.bg,
                                    color: s === 'cancelled' ? '#FF4D4D' : sCfg.color,
                                    outline: s === 'cancelled' ? '1px solid rgba(255,77,77,0.25)' : `1px solid ${sCfg.border}`,
                                    opacity: isUpdating ? 0.5 : 1,
                                  }}>
                                  {isUpdating ? 'Updating…' : `Mark as ${s}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {['delivered','cancelled'].includes(sub.status) && (
                        <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,0.04)', background: sub.status === 'delivered' ? 'rgba(45,216,122,0.04)' : 'rgba(255,77,77,0.04)' }}>
                          <span style={{ fontSize:'12px', fontWeight:'700', color: sub.status === 'delivered' ? '#2DD87A' : '#FF4D4D' }}>
                            {sub.status === 'delivered' ? '✅ Order delivered successfully' : '❌ Order cancelled'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
