import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Package, Trash2, ArrowLeft, FileCheck, Store, ShoppingCart, Image, LayoutDashboard, LogOut, ToggleLeft, ToggleRight } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const NAV = [
  { label:'Dashboard',  to:'/admin/dashboard', Icon:LayoutDashboard },
  { label:'KYC Review', to:'/admin/kyc',        Icon:FileCheck },
  { label:'Vendors',    to:'/admin/vendors',    Icon:Store },
  { label:'Products',   to:'/admin/products',   Icon:Package },
  { label:'Orders',     to:'/admin/orders',     Icon:ShoppingCart },
  { label:'Banners',    to:'/admin/banners',    Icon:Image },
];

export default function AdminProducts() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/admin/products').then(r => setProducts(r.data.products||[])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/admin/${id}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .adm-sb4{width:220px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.adm-sb4{display:none}}
        .adm-nav4{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .adm-nav4:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .adm-nav4.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .prd-row{display:flex;align-items:center;gap:14px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s}
        .prd-row:hover{background:rgba(255,255,255,0.02)}
        .prd-row:last-child{border-bottom:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <aside className="adm-sb4">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}><Store size={15} color="#080808"/></div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'14px', color:'#F0F0F0' }}>{process.env.REACT_APP_STORE_NAME||'MultiVend'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#F5A623', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>MASTER ADMIN</span>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`adm-nav4${location.pathname===to?' active':''}`}><Icon size={15}/>{label}</Link>
          ))}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'Owner'}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="adm-nav4" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}><LogOut size={15}/> Sign out</button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Link to="/admin/dashboard" style={{ color:'#686868', display:'flex' }}><ArrowLeft size={17}/></Link>
            <Package size={17} color="#F5A623"/>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0 }}>All Products</h1>
          </div>
          <span style={{ color:'#686868', fontSize:'13px' }}>{products.length} products</span>
        </div>

        <div style={{ padding:'24px 28px', maxWidth:'1000px' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
              <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#363636' }}>
              <Package size={36} style={{ margin:'0 auto 12px', display:'block', color:'#252525' }} />
              <p style={{ fontSize:'15px', color:'#505050', fontWeight:'600' }}>No products yet</p>
            </div>
          ) : (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              {products.map(p => (
                <div key={p._id} className="prd-row">
                  <img src={p.images?.[0]} alt={p.name} style={{ width:'48px', height:'48px', borderRadius:'10px', objectFit:'cover', background:'#1a1a1a', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p className="line-clamp-1" style={{ color:'#E0E0E0', fontSize:'14px', fontWeight:'600', marginBottom:'3px' }}>{p.name}</p>
                    <p style={{ color:'#505050', fontSize:'12px', marginBottom:'4px' }}>{p.vendor?.businessName||p.vendor?.name} · {p.category?.name}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', color:'#F5A623' }}>₹{p.effectivePrice?.toLocaleString('en-IN')}</span>
                      <span className={`badge ${p.isActive?'badge-green':'badge-red'}`}>{p.isActive?'Active':'Hidden'}</span>
                      {p.isFeatured && <span className="badge badge-amber">Featured</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ color: p.totalStock>0?'#2DD87A':'#FF4D4D', fontSize:'12px', fontWeight:'600' }}>
                      {p.totalStock||0} stock
                    </span>
                    <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting===p._id}
                      style={{ width:'34px', height:'34px', borderRadius:'9px', background:'rgba(255,77,77,0.07)', border:'1px solid rgba(255,77,77,0.2)', color:'#FF4D4D', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .18s', opacity: deleting===p._id ? 0.5 : 1 }}>
                      <Trash2 size={14}/>
                    </button>
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
