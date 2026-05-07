import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import useCartStore from '../../context/cartStore';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Search, Star, ArrowLeft, SlidersHorizontal } from 'lucide-react';

export default function ProductListPage() {
  const [params]   = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const { addItem } = useCartStore();
  const search   = params.get('search') || '';
  const category = params.get('category') || '';
  const featured = params.get('featured') || '';

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit: 24 });
    if (search)   q.set('search',   search);
    if (category) q.set('category', category);
    if (featured) q.set('featured', featured);
    api.get(`/products?${q}`)
      .then(r => { setProducts(r.data.products||[]); setTotal(r.data.total||0); })
      .finally(() => setLoading(false));
  }, [page, search, category, featured]);

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .plp-card{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;transition:all .22s;cursor:pointer}
        .plp-card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,0.4)}
        .plp-img{width:100%;aspect-ratio:1;object-fit:cover;transition:transform .3s}
        .plp-card:hover .plp-img{transform:scale(1.04)}
        .plp-cart{position:absolute;bottom:8px;right:8px;width:34px;height:34px;background:#F5A623;border:none;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s,transform .2s;transform:translateY(6px)}
        .plp-card:hover .plp-cart{opacity:1;transform:translateY(0)}
        .pg-btn{padding:8px 16px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#686868;font-family:'Outfit',sans-serif}
        .pg-btn:hover:not(:disabled){background:rgba(255,255,255,0.05);color:#F0F0F0}
        .pg-btn:disabled{opacity:.4;cursor:not-allowed}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 24px', background:'rgba(8,8,8,0.85)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', display:'flex', alignItems:'center', gap:'16px' }}>
          <Link to="/" style={{ color:'#686868', textDecoration:'none', display:'flex', alignItems:'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'18px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.025em', margin:0 }}>
              {search ? `"${search}"` : featured ? 'Featured Products' : 'All Products'}
            </h1>
            <p style={{ color:'#505050', fontSize:'12px', margin:0 }}>{total} products</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'24px' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:'14px' }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ background:'#111', borderRadius:'14px', overflow:'hidden' }}>
                <div className="skeleton" style={{ aspectRatio:'1', width:'100%' }} />
                <div style={{ padding:'12px' }}>
                  <div className="skeleton" style={{ height:'13px', marginBottom:'8px', width:'85%' }} />
                  <div className="skeleton" style={{ height:'13px', width:'55%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#363636' }}>
            <Search size={40} style={{ margin:'0 auto 12px', color:'#252525', display:'block' }} />
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'20px', color:'#E0E0E0', marginBottom:'8px' }}>No products found</h2>
            <p style={{ fontSize:'14px' }}>Try a different search term</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:'14px' }}>
              {products.map(p => {
                const disc = p.baseMrp > p.basePrice ? Math.round(((p.baseMrp-p.basePrice)/p.baseMrp)*100) : 0;
                return (
                  <div key={p._id} className="plp-card">
                    <Link to={`/products/${p.slug}`} style={{ display:'block', position:'relative', overflow:'hidden' }}>
                      <img src={p.images?.[0]} alt={p.name} className="plp-img" />
                      {disc > 0 && <span style={{ position:'absolute', top:'8px', left:'8px', background:'#FF4D4D', color:'white', fontSize:'10px', fontWeight:'800', padding:'2px 7px', borderRadius:'6px' }}>-{disc}%</span>}
                      <button className="plp-cart" onClick={e => { e.preventDefault(); e.stopPropagation(); addItem(p); toast.success('Added!'); }}>
                        <ShoppingCart size={14} color="#080808" />
                      </button>
                    </Link>
                    <div style={{ padding:'12px' }}>
                      <Link to={`/products/${p.slug}`} style={{ textDecoration:'none' }}>
                        <h3 className="line-clamp-2" style={{ color:'#D0D0D0', fontSize:'13px', fontWeight:'500', marginBottom:'4px', lineHeight:'1.4' }}>{p.name}</h3>
                      </Link>
                      <p style={{ color:'#484848', fontSize:'11px', marginBottom:'6px' }}>{p.vendor?.businessName||p.vendor?.name}</p>
                      {p.ratingsCount > 0 && (
                        <div style={{ display:'flex', alignItems:'center', gap:'3px', marginBottom:'6px' }}>
                          <Star size={10} fill="#F5A623" color="#F5A623" />
                          <span style={{ color:'#686868', fontSize:'11px' }}>{p.ratingsAverage?.toFixed(1)}</span>
                        </div>
                      )}
                      <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'15px', color:'#F5A623' }}>₹{p.effectivePrice?.toLocaleString('en-IN')}</span>
                        {p.baseMrp > p.basePrice && <span style={{ color:'#383838', fontSize:'12px', textDecoration:'line-through' }}>₹{p.baseMrp?.toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 24 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'40px' }}>
                <button className="pg-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Previous</button>
                <span style={{ color:'#686868', fontSize:'13px' }}>Page {page} of {Math.ceil(total/24)}</span>
                <button className="pg-btn" disabled={page>=Math.ceil(total/24)} onClick={() => setPage(p=>p+1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
