import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { FileCheck, ChevronRight, Clock, CheckCircle, XCircle, ArrowLeft, Store, Package, ShoppingCart, Image, LayoutDashboard, LogOut } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const NAV = [
  { label:'Dashboard',  to:'/admin/dashboard', Icon:LayoutDashboard },
  { label:'KYC Review', to:'/admin/kyc',        Icon:FileCheck },
  { label:'Vendors',    to:'/admin/vendors',    Icon:Store },
  { label:'Products',   to:'/admin/products',   Icon:Package },
  { label:'Orders',     to:'/admin/orders',     Icon:ShoppingCart },
  { label:'Banners',    to:'/admin/banners',    Icon:Image },
];

const TABS = [
  { key:'pending',  label:'Pending',  color:'#F5A623' },
  { key:'approved', label:'Approved', color:'#2DD87A' },
  { key:'rejected', label:'Rejected', color:'#FF4D4D' },
  { key:'all',      label:'All',      color:'#686868' },
];

export default function AdminKYCList() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [kycs,    setKycs]    = useState([]);
  const [status,  setStatus]  = useState('pending');
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/kyc/all?status=${status}&limit=50`)
      .then(r => { setKycs(r.data.kycs||[]); setTotal(r.data.total||0); })
      .finally(() => setLoading(false));
  }, [status]);

  const badgeClass = { pending:'badge-amber', approved:'badge-green', rejected:'badge-red' };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .adm-sb{width:220px;background:#0e0e0e;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;flex-shrink:0}
        @media(max-width:1024px){.adm-sb{display:none}}
        .adm-nav{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;color:#686868;font-size:13px;font-weight:500;text-decoration:none;transition:all .16s}
        .adm-nav:hover{color:#E0E0E0;background:rgba(255,255,255,0.05)}
        .adm-nav.active{color:#F5A623;background:rgba(245,166,35,0.1)}
        .kyc-row{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,0.04);text-decoration:none;transition:background .15s}
        .kyc-row:hover{background:rgba(255,255,255,0.02)}
        .kyc-row:last-child{border-bottom:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Sidebar */}
      <aside className="adm-sb">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'9px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Store size={15} color="#080808" />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'14px', color:'#F0F0F0' }}>{process.env.REACT_APP_STORE_NAME||'MultiVend'}</span>
          </div>
          <span style={{ fontSize:'11px', color:'#F5A623', fontWeight:'600', letterSpacing:'.05em', marginLeft:'42px' }}>MASTER ADMIN</span>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
          {NAV.map(({ label, to, Icon }) => (
            <Link key={to} to={to} className={`adm-nav${location.pathname===to?' active':''}`}>
              <Icon size={15} />{label}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding:'8px 12px', marginBottom:'4px' }}>
            <p style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'Owner'}</p>
            <p style={{ color:'#505050', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} className="adm-nav" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'#FF4D4D' }}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:'auto' }}>
        <div style={{ height:'56px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(8,8,8,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Link to="/admin/dashboard" style={{ color:'#686868', display:'flex', alignItems:'center' }}><ArrowLeft size={17}/></Link>
            <FileCheck size={17} color="#F5A623" />
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'17px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.02em', margin:0 }}>KYC Review</h1>
          </div>
          {total > 0 && <span style={{ fontSize:'12px', color:'#F5A623', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:'99px', padding:'3px 12px', fontWeight:'700' }}>{total} {status}</span>}
        </div>

        <div style={{ padding:'24px 28px', maxWidth:'900px' }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:'6px', marginBottom:'20px', background:'#0e0e0e', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'5px' }}>
            {TABS.map(({ key, label, color }) => (
              <button key={key} onClick={() => setStatus(key)}
                style={{ flex:1, padding:'9px 12px', borderRadius:'9px', border:'none', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', transition:'all .18s',
                  background: status===key ? 'rgba(255,255,255,0.07)' : 'transparent',
                  color: status===key ? color : '#686868' }}>
                {label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
              <div style={{ width:'28px', height:'28px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : kycs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#363636' }}>
              <FileCheck size={36} style={{ margin:'0 auto 12px', display:'block', color:'#252525' }} />
              <p style={{ fontSize:'15px', color:'#505050', fontWeight:'600' }}>No {status === 'all' ? '' : status} applications</p>
              <p style={{ fontSize:'13px', marginTop:'4px' }}>Check back later</p>
            </div>
          ) : (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              {kycs.map(k => (
                <Link key={k._id} to={`/admin/kyc/${k._id}`} className="kyc-row" style={{ color:'inherit' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Store size={17} color="#F5A623" />
                    </div>
                    <div>
                      <p style={{ color:'#E0E0E0', fontSize:'14px', fontWeight:'600', marginBottom:'3px' }}>{k.businessName}</p>
                      <p style={{ color:'#505050', fontSize:'12px' }}>{k.vendor?.name||'Unknown'} · {k.vendor?.email||k.vendor?.phone}</p>
                      <p style={{ color:'#363636', fontSize:'11px', marginTop:'3px' }}>
                        {new Date(k.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        {k.submissionCount > 1 && <span style={{ color:'#F5A623', marginLeft:'8px' }}>Re-submission #{k.submissionCount}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span className={`badge ${badgeClass[k.status]||'badge-gray'}`}>{k.status}</span>
                    <ChevronRight size={15} color="#505050" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
