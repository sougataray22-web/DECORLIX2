import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { ShoppingCart, ArrowLeft, FileCheck, Store, Package, Image, LayoutDashboard, LogOut, IndianRupee } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const NAV = [
  { label:'Dashboard',  to:'/admin/dashboard', Icon:LayoutDashboard },
  { label:'KYC Review', to:'/admin/kyc',        Icon:FileCheck },
  { label:'Vendors',    to:'/admin/vendors',    Icon:Store },
  { label:'Products',   to:'/admin/products',   Icon:Package },
  { label:'Orders',     to:'/admin/orders',     Icon:ShoppingCart },
  { label:'Banners',    to:'/admin/banners',    Icon:Image },
];

const STATUS_FILTERS = ['all','pending','confirmed','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState('all');
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    const q = status !== 'all' ? `?status=${status}` : '';
    api.get(`/admin/orders${q}`).then(r => { setOrders(r.data.orders||[]); setTotal(r.data.total||0); }).finally(() => setLoading(false));
  }, [status]);

  const payColor = { paid:'#2DD87A', pending:'#F5A623', failed:'#FF4D4D' };
  const statusColor = { delivered:'#2DD87A', shipped:'#4DA6FF', confirmed:'#A78BFA', pending:'#F5A623', cancelled:'#FF4D4D', processing:'#FB923C' };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .adm-sb3{width:220px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.adm-sb3{display:none}}
        .adm-nav3{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .adm-nav3:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .adm-nav3.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .ord-row{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s}
        .ord-row:hover{background:rgba(255,255,255,0.02)}
        .ord-row:last-child{border-bottom:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <aside className="adm-sb3">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}><Store size={15} color="#080808"/></div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'14px', color:'#F0F0F0' }}>{process.env.REACT_APP_STORE_NAME||'MultiVend'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#F5A623', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>MASTER ADMIN</span>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`adm-nav3${location.pathname===to?' active':''}`}><Icon size={15}/>{label}</Link>
          ))}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'Owner'}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="adm-nav3" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}><LogOut size={15}/> Sign out</button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Link to="/admin/dashboard" style={{ color:'#686868', display:'flex' }}><ArrowLeft size={17}/></Link>
            <ShoppingCart size={17} color="#F5A623"/>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0 }}>All Orders</h1>
          </div>
          <span style={{ color:'#686868', fontSize:'13px' }}>{total} orders</span>
        </div>

        <div style={{ padding:'24px 28px', maxWidth:'1000px' }}>
          {/* Status filters */}
          <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                style={{ padding:'7px 14px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:'600', fontSize:'12px', textTransform:'capitalize', transition:'all .18s',
                  background: status===s ? '#F5A623' : 'rgba(255,255,255,0.04)',
                  color: status===s ? '#080808' : '#686868',
                  outline: status!==s ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                {s === 'all' ? 'All Orders' : s}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
              <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#363636' }}>
              <ShoppingCart size={36} style={{ margin:'0 auto 12px', display:'block', color:'#252525' }} />
              <p style={{ fontSize:'15px', color:'#505050', fontWeight:'600' }}>No orders found</p>
            </div>
          ) : (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              {orders.map(o => (
                <div key={o._id} className="ord-row">
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', color:'#F0F0F0' }}>{o.orderNumber}</span>
                      <span style={{ fontSize:'11px', color: statusColor[o.status]||'#686868', fontWeight:'600', textTransform:'capitalize' }}>{o.status}</span>
                    </div>
                    <p style={{ color:'#505050', fontSize:'12px', marginBottom:'4px' }}>
                      {o.customer?.name||o.customer?.email} · {new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </p>
                    <p style={{ color:'#363636', fontSize:'12px' }}>
                      {o.subOrders?.length||0} vendor(s) · {o.subOrders?.reduce((s,sub)=>s+sub.items.length,0)||0} item(s)
                    </p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'18px', color:'#F5A623', letterSpacing:'-0.03em', marginBottom:'6px' }}>
                      ₹{o.grandTotal?.toLocaleString('en-IN')}
                    </p>
                    <span className={`badge ${o.paymentStatus==='paid'?'badge-green':o.paymentStatus==='failed'?'badge-red':'badge-amber'}`}>{o.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
