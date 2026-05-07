import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import { LayoutDashboard, Package, ShoppingCart, IndianRupee, Plus, TrendingUp, LogOut, Store, ChevronRight, BarChart2 } from 'lucide-react';

const NAV = [
  { label:'Dashboard', to:'/vendor/dashboard', Icon:LayoutDashboard },
  { label:'Products',  to:'/vendor/products',  Icon:Package },
  { label:'Orders',    to:'/vendor/orders',    Icon:ShoppingCart },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function VendorDashboard() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/vendor/analytics'),
      api.get('/orders?limit=6'),
      api.get('/products/vendor/mine?limit=6'),
    ]).then(([a, o, p]) => {
      setAnalytics(a.data.analytics);
      setOrders(o.data.orders   || []);
      setProducts(p.data.products || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .vendor-sidebar{width:210px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.vendor-sidebar{display:none}}
        .vnav{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .vnav:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .vnav.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .vstat{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px;transition:all .2s}
        .vstat:hover{border-color:rgba(255,255,255,0.12);transform:translateY(-2px)}
        .vrow{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.04)}
        .vrow:last-child{border-bottom:none}
        .vrow:hover{background:rgba(255,255,255,0.02)}
      `}</style>

      <aside className="vendor-sidebar">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'2px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Store size={15} color="#080808" />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'13px', color:'#F0F0F0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px' }}>{user?.businessName || 'My Store'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#2DD87A', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>VENDOR</span>
        </div>

        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`vnav${location.pathname===to?' active':''}`}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="vnav" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <LayoutDashboard size={16} color="#F5A623" />
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em' }}>Vendor Dashboard</h1>
          </div>
          <Link to="/vendor/products/add" style={{ display:'flex', alignItems:'center', gap:'6px', background:'#F5A623', color:'#080808', borderRadius:'10px', padding:'8px 16px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>
            <Plus size={14} /> Add Product
          </Link>
        </div>

        <div style={{ padding:'28px', maxWidth:'1000px' }}>
          {loading ? <VLoader /> : <>
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px', marginBottom:'28px' }}>
              {[
                { label:'Total Revenue',  value:`₹${(analytics?.totalRevenue||0).toLocaleString('en-IN')}`, Icon:IndianRupee, accent:'#F5A623' },
                { label:'Total Orders',   value:analytics?.totalOrders||0, Icon:ShoppingCart, accent:'#4DA6FF' },
                { label:'Products Listed',value:products.length,           Icon:Package,      accent:'#9B59B6' },
                { label:'This Month',     value:`₹${(analytics?.monthlyRevenue?.at(-1)?.revenue||0).toLocaleString('en-IN')}`, Icon:TrendingUp, accent:'#2DD87A' },
              ].map(({ label, value, Icon, accent }) => (
                <div key={label} className="vstat">
                  <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                    <Icon size={15} color={accent} />
                  </div>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.03em', marginBottom:'3px' }}>{value}</p>
                  <p style={{ color:'#686868', fontSize:'12px' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            {analytics?.monthlyRevenue?.length > 0 && (
              <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px', marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
                  <BarChart2 size={15} color="#F5A623" />
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'700', color:'#F0F0F0' }}>Revenue — Last 6 Months</span>
                </div>
                <MiniChart data={analytics.monthlyRevenue} />
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {/* Orders */}
              <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'700', color:'#F0F0F0' }}>Recent Orders</span>
                  <Link to="/vendor/orders" style={{ color:'#F5A623', fontSize:'12px', fontWeight:'600', textDecoration:'none', display:'flex', alignItems:'center', gap:'2px' }}>
                    View all <ChevronRight size={13} />
                  </Link>
                </div>
                {orders.length === 0 ? <Empty msg="No orders yet" /> : orders.map(o => (
                  <div key={o._id} className="vrow">
                    <div>
                      <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{o.orderNumber}</p>
                      <p style={{ color:'#505050', fontSize:'11px' }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ color:'#F5A623', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', marginBottom:'3px' }}>₹{o.grandTotal?.toLocaleString('en-IN')}</p>
                      <StatusText s={o.status} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Products */}
              <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'14px', fontWeight:'700', color:'#F0F0F0' }}>My Products</span>
                  <Link to="/vendor/products" style={{ color:'#F5A623', fontSize:'12px', fontWeight:'600', textDecoration:'none', display:'flex', alignItems:'center', gap:'2px' }}>
                    Manage <ChevronRight size={13} />
                  </Link>
                </div>
                {products.length === 0 ? <Empty msg="No products yet" /> : products.map(p => (
                  <div key={p._id} className="vrow" style={{ gap:'12px' }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width:'38px', height:'38px', borderRadius:'8px', objectFit:'cover', background:'#1a1a1a', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="line-clamp-1" style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'2px' }}>{p.name}</p>
                      <p style={{ color:'#F5A623', fontSize:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'700' }}>₹{p.effectivePrice?.toLocaleString('en-IN')}</p>
                    </div>
                    <span style={{ fontSize:'11px', color: p.totalStock > 0 ? '#2DD87A' : '#FF4D4D', flexShrink:0, fontWeight:'600' }}>
                      {p.totalStock > 0 ? `${p.totalStock}` : 'Out'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>}
        </div>
      </main>
    </div>
  );
}

function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'80px' }}>
      {data.map(d => (
        <div key={`${d._id.year}-${d._id.month}`} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
          <div style={{ width:'100%', background:'rgba(245,166,35,0.15)', borderRadius:'4px 4px 0 0', position:'relative', overflow:'hidden', height:`${Math.max((d.revenue/max)*100,4)}%` }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, #F5A623, rgba(245,166,35,0.5))', borderRadius:'4px 4px 0 0' }} />
          </div>
          <span style={{ color:'#505050', fontSize:'10px', fontWeight:'500' }}>{MONTHS[d._id.month-1]}</span>
        </div>
      ))}
    </div>
  );
}

const StatusText = ({ s }) => {
  const c = { delivered:'#2DD87A', shipped:'#4DA6FF', confirmed:'#A78BFA', pending:'#F5A623', cancelled:'#FF4D4D' };
  return <span style={{ fontSize:'11px', color: c[s]||'#686868', fontWeight:'600', textTransform:'capitalize' }}>{s}</span>;
};
const Empty = ({ msg }) => (
  <div style={{ padding:'32px', textAlign:'center', color:'#363636', fontSize:'13px' }}>{msg}</div>
);
const VLoader = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'250px' }}>
    <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);
