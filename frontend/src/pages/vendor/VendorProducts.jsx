import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit3, Trash2, Package, LayoutDashboard, ShoppingCart, LogOut, Store, Search } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const NAV = [
  { label:'Dashboard', to:'/vendor/dashboard', Icon:LayoutDashboard },
  { label:'Products',  to:'/vendor/products',  Icon:Package },
  { label:'Orders',    to:'/vendor/orders',    Icon:ShoppingCart },
];

export default function VendorProducts() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState('');

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products/vendor/mine').then(r => setProducts(r.data.products||[])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    try { await api.delete(`/products/vendor/${id}`); toast.success('Deleted.'); fetchProducts(); }
    catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const filtered = search ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) : products;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .vnd-sb{width:210px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.vnd-sb{display:none}}
        .vnd-nav{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .vnd-nav:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .vnd-nav.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .prd-card{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;transition:all .18s}
        .prd-card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <aside className="vnd-sb">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'2px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}><Store size={15} color="#080808"/></div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'13px', color:'#F0F0F0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'130px' }}>{user?.businessName||'My Store'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#2DD87A', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>VENDOR</span>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`vnd-nav${location.pathname===to?' active':''}`}><Icon size={15}/>{label}</Link>
          ))}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="vnd-nav" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}><LogOut size={15}/> Sign out</button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Package size={16} color="#F5A623"/>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0 }}>My Products</h1>
            <span style={{ color:'#686868', fontSize:'13px' }}>({products.length})</span>
          </div>
          <Link to="/vendor/products/add" style={{ display:'flex', alignItems:'center', gap:'6px', background:'#F5A623', color:'#080808', borderRadius:'10px', padding:'8px 16px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>
            <Plus size={14}/> Add Product
          </Link>
        </div>

        <div style={{ padding:'24px 28px' }}>
          {/* Search */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden', marginBottom:'20px', maxWidth:'400px' }}>
            <span style={{ padding:'0 14px', display:'flex', alignItems:'center', color:'#505050' }}><Search size={15}/></span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your products…" style={{ flex:1, background:'transparent', border:'none', padding:'11px 0', fontSize:'14px', color:'#F0F0F0', fontFamily:"'Outfit',sans-serif", outline:'none' }} />
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
              <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#363636' }}>
              <Package size={36} style={{ margin:'0 auto 12px', display:'block', color:'#252525' }} />
              <p style={{ fontSize:'15px', color:'#505050', fontWeight:'600' }}>{search ? 'No products match your search' : 'No products yet'}</p>
              {!search && (
                <Link to="/vendor/products/add" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'16px', background:'#F5A623', color:'#080808', padding:'10px 20px', borderRadius:'10px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', textDecoration:'none' }}>
                  <Plus size={14}/> List Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'14px' }}>
              {filtered.map(p => (
                <div key={p._id} className="prd-card">
                  <div style={{ position:'relative', overflow:'hidden' }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', top:'8px', right:'8px', display:'flex', gap:'6px' }}>
                      <Link to={`/vendor/products/${p._id}/edit`}
                        style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(8,8,8,0.8)', border:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'#E0E0E0', textDecoration:'none', transition:'all .18s' }}>
                        <Edit3 size={13}/>
                      </Link>
                      <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting===p._id}
                        style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(255,77,77,0.15)', border:'1px solid rgba(255,77,77,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#FF4D4D', cursor:'pointer', transition:'all .18s', opacity: deleting===p._id?0.5:1 }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                    {!p.isActive && (
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.7)', padding:'6px', textAlign:'center' }}>
                        <span style={{ color:'#FF4D4D', fontSize:'11px', fontWeight:'700' }}>HIDDEN</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding:'12px' }}>
                    <p className="line-clamp-2" style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'6px', lineHeight:'1.4' }}>{p.name}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'16px', color:'#F5A623' }}>₹{p.effectivePrice?.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize:'11px', color: p.totalStock>0?'#2DD87A':'#FF4D4D', fontWeight:'700' }}>
                        {p.totalStock > 0 ? `${p.totalStock} left` : 'Out of stock'}
                      </span>
                    </div>
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
