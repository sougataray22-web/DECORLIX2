import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Store, ArrowLeft, ToggleLeft, ToggleRight, FileCheck, Package, ShoppingCart, Image, LayoutDashboard, LogOut, Search } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const NAV = [
  { label:'Dashboard',  to:'/admin/dashboard', Icon:LayoutDashboard },
  { label:'KYC Review', to:'/admin/kyc',        Icon:FileCheck },
  { label:'Vendors',    to:'/admin/vendors',    Icon:Store },
  { label:'Products',   to:'/admin/products',   Icon:Package },
  { label:'Orders',     to:'/admin/orders',     Icon:ShoppingCart },
  { label:'Banners',    to:'/admin/banners',    Icon:Image },
];

export default function AdminVendors() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [toggling, setToggling] = useState(null);

  const fetchVendors = () => {
    setLoading(true);
    const q = filter !== 'all' ? `?isApproved=${filter === 'approved'}` : '';
    api.get(`/admin/vendors${q}`).then(r => setVendors(r.data.vendors||[])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, [filter]);

  const toggle = async (id) => {
    setToggling(id);
    try {
      const res = await api.patch(`/admin/vendors/${id}/toggle`);
      toast.success(res.data.message);
      fetchVendors();
    } catch { toast.error('Action failed.'); }
    finally { setToggling(null); }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .adm-sb2{width:220px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.adm-sb2{display:none}}
        .adm-nav2{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .adm-nav2:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .adm-nav2.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .vend-row{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background .15s}
        .vend-row:hover{background:rgba(255,255,255,0.02)}
        .vend-row:last-child{border-bottom:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <aside className="adm-sb2">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}><Store size={15} color="#080808" /></div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'14px', color:'#F0F0F0' }}>{process.env.REACT_APP_STORE_NAME||'MultiVend'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#F5A623', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>MASTER ADMIN</span>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`adm-nav2${location.pathname===to?' active':''}`}><Icon size={15}/>{label}</Link>
          ))}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'Owner'}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="adm-nav2" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}><LogOut size={15}/> Sign out</button>
        </div>
      </aside>

      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Link to="/admin/dashboard" style={{ color:'#686868', display:'flex' }}><ArrowLeft size={17}/></Link>
            <Store size={17} color="#F5A623" />
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0 }}>Vendors</h1>
          </div>
          <span style={{ color:'#686868', fontSize:'13px' }}>{vendors.length} vendors</span>
        </div>

        <div style={{ padding:'24px 28px', maxWidth:'900px' }}>
          {/* Filter tabs */}
          <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
            {['all','approved','pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:'8px 18px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', textTransform:'capitalize', transition:'all .18s',
                  background: filter===f ? '#F5A623' : 'rgba(255,255,255,0.04)',
                  color: filter===f ? '#080808' : '#686868',
                  outline: filter!==f ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
              <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : vendors.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#363636' }}>
              <Store size={36} style={{ margin:'0 auto 12px', display:'block', color:'#252525' }} />
              <p style={{ fontSize:'15px', color:'#505050', fontWeight:'600' }}>No vendors found</p>
            </div>
          ) : (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              {vendors.map(v => (
                <div key={v._id} className="vend-row">
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Store size={17} color="#686868" />
                    </div>
                    <div>
                      <p style={{ color:'#E0E0E0', fontSize:'14px', fontWeight:'600', marginBottom:'3px' }}>{v.businessName||v.name}</p>
                      <p style={{ color:'#505050', fontSize:'12px', marginBottom:'5px' }}>{v.email||v.phone}</p>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <span className={`badge ${v.isApproved ? 'badge-green' : 'badge-amber'}`}>{v.isApproved ? 'KYC Approved' : 'Pending KYC'}</span>
                        <span className={`badge ${v.isActive ? 'badge-blue' : 'badge-red'}`}>{v.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggle(v._id)} disabled={toggling === v._id}
                    style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 16px', borderRadius:'9px', border:`1px solid ${v.isActive ? 'rgba(255,77,77,0.25)' : 'rgba(45,216,122,0.25)'}`, background: v.isActive ? 'rgba(255,77,77,0.07)' : 'rgba(45,216,122,0.07)', color: v.isActive ? '#FF4D4D' : '#2DD87A', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'12px', cursor:'pointer', transition:'all .18s', opacity: toggling===v._id ? 0.5 : 1 }}>
                    {v.isActive ? <ToggleRight size={15}/> : <ToggleLeft size={15}/>}
                    {v.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
