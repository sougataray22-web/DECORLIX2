import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import { LayoutDashboard, Store, Package, ShoppingCart, IndianRupee, FileCheck, Image, LogOut, TrendingUp, ChevronRight, Users, AlertCircle, Clock } from 'lucide-react';

const NAV = [
  { label:'Dashboard',  to:'/admin/dashboard', Icon:LayoutDashboard },
  { label:'KYC Review', to:'/admin/kyc',        Icon:FileCheck },
  { label:'Vendors',    to:'/admin/vendors',    Icon:Store },
  { label:'Products',   to:'/admin/products',   Icon:Package },
  { label:'Orders',     to:'/admin/orders',     Icon:ShoppingCart },
  { label:'Banners',    to:'/admin/banners',    Icon:Image },
];

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [stats,   setStats]   = useState(null);
  const [kycs,    setKycs]    = useState([]);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/kyc/all?status=pending&limit=5'),
      api.get('/admin/orders?limit=6'),
    ]).then(([s, k, o]) => {
      setStats(s.data.stats);
      setKycs(k.data.kycs   || []);
      setOrders(o.data.orders || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .admin-sidebar{width:220px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.admin-sidebar{display:none}}
        .nav-link{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s;cursor:pointer;border:none;background:none;width:100%}
        .nav-link:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .nav-link.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .stat-card{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px;transition:all .2s}
        .stat-card:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-2px)}
        .table-row{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s}
        .table-row:hover{background:rgba(255,255,255,0.02)}
        .table-row:last-child{border-bottom:none}
      `}</style>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Store size={15} color="#080808" />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'14px', color:'#F0F0F0' }}>{process.env.REACT_APP_STORE_NAME || 'MultiVend'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#F5A623', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>MASTER ADMIN</span>
        </div>

        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`nav-link${location.pathname===to?' active':''}`}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'Owner'}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="nav-link" style={{ color:'#FF4D4D' }}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:'auto' }}>
        {/* Top bar */}
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <LayoutDashboard size={17} color="#F5A623" />
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em' }}>Master Control Panel</h1>
          </div>
          <span style={{ fontSize:'11px', color:'#F5A623', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:'99px', padding:'3px 12px', fontWeight:'600', letterSpacing:'.04em' }}>OWNER</span>
        </div>

        <div style={{ padding:'28px', maxWidth:'1100px' }}>
          {loading ? <AdminLoader /> : <>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:'12px', marginBottom:'28px' }}>
              {[
                { label:'Revenue',   value:`₹${(stats?.totalRevenue||0).toLocaleString('en-IN')}`, Icon:IndianRupee, accent:'#F5A623' },
                { label:'Orders',    value:stats?.orders    || 0, Icon:ShoppingCart, accent:'#4DA6FF' },
                { label:'Products',  value:stats?.products  || 0, Icon:Package,      accent:'#9B59B6' },
                { label:'Vendors',   value:stats?.vendors   || 0, Icon:Store,        accent:'#2DD87A' },
                { label:'Customers', value:stats?.customers || 0, Icon:Users,        accent:'#FF7043' },
              ].map(({ label, value, Icon, accent }) => (
                <div key={label} className="stat-card">
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                    <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={16} color={accent} />
                    </div>
                  </div>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'22px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.03em', marginBottom:'4px' }}>{value}</p>
                  <p style={{ color:'#686868', fontSize:'12px', fontWeight:'500' }}>{label}</p>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {/* Pending KYCs */}
              <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <Clock size={15} color="#F5A623" />
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'700', color:'#F0F0F0' }}>Pending KYC</span>
                    {kycs.length > 0 && <span style={{ background:'#F5A623', color:'#080808', fontSize:'10px', fontWeight:'800', padding:'1px 6px', borderRadius:'99px', fontFamily:"'Syne',sans-serif" }}>{kycs.length}</span>}
                  </div>
                  <Link to="/admin/kyc" style={{ color:'#F5A623', fontSize:'12px', fontWeight:'600', textDecoration:'none', display:'flex', alignItems:'center', gap:'2px' }}>
                    View all <ChevronRight size={13} />
                  </Link>
                </div>
                {kycs.length === 0 ? (
                  <div style={{ padding:'40px', textAlign:'center', color:'#363636' }}>
                    <AlertCircle size={24} style={{ margin:'0 auto 8px' }} />
                    <p style={{ fontSize:'13px' }}>No pending requests</p>
                  </div>
                ) : kycs.map(k => (
                  <Link key={k._id} to={`/admin/kyc/${k._id}`} className="table-row" style={{ textDecoration:'none' }}>
                    <div>
                      <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{k.businessName}</p>
                      <p style={{ color:'#505050', fontSize:'12px' }}>{k.vendor?.email || k.vendor?.phone}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span className="badge badge-amber">Pending</span>
                      <ChevronRight size={13} color="#505050" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Orders */}
              <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <TrendingUp size={15} color="#F5A623" />
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'700', color:'#F0F0F0' }}>Recent Orders</span>
                  </div>
                  <Link to="/admin/orders" style={{ color:'#F5A623', fontSize:'12px', fontWeight:'600', textDecoration:'none', display:'flex', alignItems:'center', gap:'2px' }}>
                    View all <ChevronRight size={13} />
                  </Link>
                </div>
                {orders.length === 0 ? (
                  <div style={{ padding:'40px', textAlign:'center', color:'#363636' }}>
                    <ShoppingCart size={24} style={{ margin:'0 auto 8px' }} />
                    <p style={{ fontSize:'13px' }}>No orders yet</p>
                  </div>
                ) : orders.map(o => (
                  <div key={o._id} className="table-row">
                    <div>
                      <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{o.orderNumber}</p>
                      <p style={{ color:'#505050', fontSize:'12px' }}>{o.customer?.name || o.customer?.email}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ color:'#F5A623', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', marginBottom:'4px' }}>₹{o.grandTotal?.toLocaleString('en-IN')}</p>
                      <PayBadge s={o.paymentStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', marginTop:'16px' }}>
              {NAV.map(({ label, to, Icon }) => (
                <Link key={to} to={to} style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', textDecoration:'none', color:'#686868', fontSize:'12px', fontWeight:'500', transition:'all .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(245,166,35,0.3)'; e.currentTarget.style.color='#F5A623'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#686868'; }}>
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </>}
        </div>
      </main>
    </div>
  );
}

const PayBadge = ({ s }) => {
  const m = { paid:'badge-green', pending:'badge-amber', failed:'badge-red' };
  return <span className={`badge ${m[s]||'badge-gray'}`}>{s}</span>;
};

const AdminLoader = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'300px' }}>
    <div style={{ width:'32px', height:'32px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);
