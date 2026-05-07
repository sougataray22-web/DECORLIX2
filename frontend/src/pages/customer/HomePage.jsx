import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import useCartStore from '../../context/cartStore';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Search, User, Store, ChevronLeft, ChevronRight, Star, Zap, Shield, RotateCcw, ArrowRight, Package } from 'lucide-react';

const S = {
  nav: { position:'sticky', top:0, zIndex:50, background:'rgba(8,8,8,0.85)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  logo: { display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' },
  logoBox: { width:'34px', height:'34px', borderRadius:'10px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  logoText: { fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'16px', color:'#F0F0F0' },
  searchWrap: { flex:1, maxWidth:'480px', display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden', transition:'border-color .18s' },
  searchInput: { flex:1, background:'transparent', border:'none', padding:'10px 16px', fontSize:'14px', color:'#F0F0F0', fontFamily:"'Outfit',sans-serif", outline:'none' },
};

export default function HomePage() {
  const [banners,   setBanners]   = useState([]);
  const [products,  setProducts]  = useState([]);
  const [featured,  setFeatured]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);
  const [userMenu,  setUserMenu]  = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { addItem, itemCount }            = useCartStore();
  const navigate = useNavigate();
  const menuRef  = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/banners'),
      api.get('/products?limit=12&sort=-createdAt'),
      api.get('/products?featured=true&limit=6'),
    ]).then(([b, p, f]) => {
      setBanners(b.data.banners  || []);
      setProducts(p.data.products || []);
      setFeatured(f.data.products || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBannerIdx(i => (i+1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const onBannerClick = (b) => {
    if (b.targetType === 'url' && b.targetUrl) window.open(b.targetUrl, '_blank');
    if (b.targetType === 'product'  && b.targetId) navigate(`/products/${b.targetId}`);
    if (b.targetType === 'category' && b.targetId) navigate(`/products?category=${b.targetId}`);
  };

  const onAddCart = (p) => {
    addItem(p); toast.success(`Added to cart!`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .nav-inner{max-width:1280px;margin:0 auto;padding:0 20px;height:60px;display:flex;align-items:center;gap:16px}
        .search-wrap:focus-within{border-color:rgba(245,166,35,0.5)!important}
        .product-card{background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;transition:all .22s;cursor:pointer}
        .product-card:hover{border-color:rgba(255,255,255,0.13);transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.4)}
        .product-img{width:100%;aspect-ratio:1;object-fit:cover;transition:transform .35s}
        .product-card:hover .product-img{transform:scale(1.04)}
        .cart-fab{position:absolute;bottom:10px;right:10px;width:36px;height:36px;background:#F5A623;border:none;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s,transform .2s;transform:translateY(4px)}
        .product-card:hover .cart-fab{opacity:1;transform:translateY(0)}
        .hero-slide{position:absolute;inset:0;transition:opacity .8s ease}
        .badge-discount{position:absolute;top:10px;left:10px;background:#FF4D4D;color:white;font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px}
        .user-menu{position:absolute;top:calc(100% + 8px);right:0;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:6px;min-width:180px;z-index:100;box-shadow:0 16px 40px rgba(0,0,0,0.5)}
        .user-menu a, .user-menu button{display:block;width:100%;text-align:left;padding:10px 14px;border-radius:9px;font-size:13px;font-weight:500;color:#A0A0A0;text-decoration:none;background:none;border:none;cursor:pointer;font-family:'Outfit',sans-serif;transition:background .15s,color .15s}
        .user-menu a:hover,.user-menu button:hover{background:rgba(255,255,255,0.05);color:#F0F0F0}
        .section-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#F0F0F0;letter-spacing:-0.025em}
        @media(max-width:640px){.hero-text-h2{font-size:28px!important}}
        .feature-pill{display:flex;align-items:center;gap:8px;padding:10px 18px;background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:99px;font-size:13px;color:#A0A0A0}
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={S.nav}>
        <div className="nav-inner">
          <Link to="/" style={S.logo}>
            <div style={S.logoBox}><Store size={16} color="#080808" /></div>
            <span style={S.logoText}>{process.env.REACT_APP_STORE_NAME || 'MultiVend'}</span>
          </Link>

          <form onSubmit={handleSearch} style={{ flex:1, maxWidth:'480px' }}>
            <div className="search-wrap" style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden', transition:'border-color .18s' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, brands, categories…" style={{ flex:1, background:'transparent', border:'none', padding:'10px 16px', fontSize:'14px', color:'#F0F0F0', fontFamily:"'Outfit',sans-serif", outline:'none' }} />
              <button type="submit" style={{ padding:'0 14px', background:'transparent', border:'none', cursor:'pointer', color:'#686868' }}>
                <Search size={16} />
              </button>
            </div>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginLeft:'auto' }}>
            <Link to="/cart" style={{ position:'relative', width:'38px', height:'38px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', color:'#A0A0A0', textDecoration:'none', transition:'all .18s' }}>
              <ShoppingCart size={17} />
              {itemCount() > 0 && (
                <span style={{ position:'absolute', top:'-4px', right:'-4px', width:'18px', height:'18px', borderRadius:'50%', background:'#F5A623', color:'#080808', fontSize:'10px', fontWeight:'800', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif" }}>
                  {itemCount()}
                </span>
              )}
            </Link>

            {isAuthenticated() ? (
              <div style={{ position:'relative' }} ref={menuRef}>
                <button onClick={() => setUserMenu(!userMenu)}
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 12px 6px 6px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', cursor:'pointer', color:'#F0F0F0', fontFamily:"'Outfit',sans-serif", fontSize:'13px', fontWeight:'500' }}>
                  <div style={{ width:'26px', height:'26px', borderRadius:'8px', background:'rgba(245,166,35,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <User size={14} color="#F5A623" />
                  </div>
                  {user?.name?.split(' ')[0] || 'Account'}
                </button>
                {userMenu && (
                  <div className="user-menu">
                    {user?.role==='owner'  && <Link to="/admin/dashboard"  onClick={() => setUserMenu(false)}>Admin Panel</Link>}
                    {user?.role==='vendor' && <Link to="/vendor/dashboard" onClick={() => setUserMenu(false)}>Vendor Panel</Link>}
                    <Link to="/orders"  onClick={() => setUserMenu(false)}>My Orders</Link>
                    <Link to="/profile" onClick={() => setUserMenu(false)}>Profile</Link>
                    <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
                    <button onClick={() => { logout(); setUserMenu(false); }} style={{ color:'#FF4D4D!important' }}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                style={{ padding:'8px 18px', background:'#F5A623', color:'#080808', borderRadius:'10px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'13px', textDecoration:'none', transition:'all .18s' }}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      {banners.length > 0 && (
        <div style={{ position:'relative', height:'420px', overflow:'hidden', background:'#0d0d0d' }}>
          {banners.map((b, i) => (
            <div key={b._id} className="hero-slide" onClick={() => onBannerClick(b)}
              style={{ opacity: i===bannerIdx ? 1 : 0, cursor: b.targetType!=='none' ? 'pointer' : 'default' }}>
              <img src={b.imageUrl} alt={b.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 50%, transparent 100%)' }} />
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px', maxWidth:'640px' }}>
                <h2 className="hero-text-h2" style={{ fontFamily:"'Syne',sans-serif", fontSize:'40px', fontWeight:'800', color:'#F0F0F0', lineHeight:'1.15', letterSpacing:'-0.03em', marginBottom:'12px' }}>{b.title}</h2>
                {b.subtitle && <p style={{ color:'rgba(240,240,240,0.65)', fontSize:'16px', marginBottom:'24px', maxWidth:'400px' }}>{b.subtitle}</p>}
                {b.targetType !== 'none' && (
                  <button style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#F5A623', color:'#080808', border:'none', borderRadius:'10px', padding:'12px 22px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer', width:'fit-content' }}>
                    Shop Now <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {banners.length > 1 && <>
            <button onClick={() => setBannerIdx(i => (i-1+banners.length)%banners.length)}
              style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setBannerIdx(i => (i+1)%banners.length)}
              style={{ position:'absolute', right:'16px', top:'50%', transform:'translateY(-50%)', width:'36px', height:'36px', borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <ChevronRight size={18} />
            </button>
            <div style={{ position:'absolute', bottom:'16px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'6px' }}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  style={{ height:'4px', borderRadius:'99px', border:'none', cursor:'pointer', transition:'all .3s', background: i===bannerIdx ? '#F5A623' : 'rgba(255,255,255,0.3)', width: i===bannerIdx ? '24px' : '4px' }} />
              ))}
            </div>
          </>}
        </div>
      )}

      {/* ── Trust pills ─────────────────────────────────────────────────── */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px', height:'52px', display:'flex', alignItems:'center', gap:'24px', overflow:'auto' }}>
          {[
            { Icon:Zap,       label:'Free delivery over ₹499' },
            { Icon:Shield,    label:'Secure payments' },
            { Icon:RotateCcw, label:'7-day easy returns' },
            { Icon:Package,   label:'100+ verified vendors' },
          ].map(({ Icon, label }) => (
            <div key={label} className="feature-pill" style={{ flexShrink:0 }}>
              <Icon size={14} color="#F5A623" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 20px' }}>

        {/* ── Featured ────────────────────────────────────────────────────── */}
        {featured.length > 0 && (
          <section style={{ padding:'48px 0 0' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'4px', height:'22px', borderRadius:'99px', background:'#F5A623' }} />
                <h2 className="section-title">Featured Products</h2>
              </div>
              <Link to="/products?featured=true" style={{ display:'flex', alignItems:'center', gap:'4px', color:'#F5A623', fontSize:'13px', fontWeight:'600', textDecoration:'none' }}>
                View all <ChevronRight size={15} />
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:'14px' }}>
              {featured.map(p => <ProductCard key={p._id} product={p} onAddToCart={onAddCart} />)}
            </div>
          </section>
        )}

        {/* ── Latest Products ──────────────────────────────────────────────── */}
        <section style={{ padding:'48px 0 64px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'4px', height:'22px', borderRadius:'99px', background:'#F5A623' }} />
              <h2 className="section-title">Latest Arrivals</h2>
            </div>
            <Link to="/products" style={{ display:'flex', alignItems:'center', gap:'4px', color:'#F5A623', fontSize:'13px', fontWeight:'600', textDecoration:'none' }}>
              View all <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background:'#111', borderRadius:'16px', overflow:'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio:'1', width:'100%' }} />
                  <div style={{ padding:'14px' }}>
                    <div className="skeleton" style={{ height:'14px', marginBottom:'8px', width:'80%' }} />
                    <div className="skeleton" style={{ height:'12px', width:'50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'#363636' }}>
              <Store size={40} style={{ marginBottom:'12px', color:'#252525' }} />
              <p style={{ fontSize:'15px' }}>No products yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px' }}>
              {products.map(p => <ProductCard key={p._id} product={p} onAddToCart={onAddCart} />)}
            </div>
          )}
        </section>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', background:'#0a0a0a', padding:'40px 20px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', justifyContent:'center', marginBottom:'12px' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Store size={14} color="#080808" />
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', color:'#F0F0F0' }}>{process.env.REACT_APP_STORE_NAME || 'MultiVend'}</span>
        </div>
        <p style={{ color:'#363636', fontSize:'13px' }}>Multi-Vendor Marketplace · © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const discount = product.baseMrp > product.basePrice
    ? Math.round(((product.baseMrp - product.basePrice) / product.baseMrp) * 100) : 0;
  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} style={{ display:'block', position:'relative', overflow:'hidden' }}>
        <img src={product.images?.[0]} alt={product.name} className="product-img" />
        {discount > 0 && <span className="badge-discount">-{discount}%</span>}
        <button className="cart-fab" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}>
          <ShoppingCart size={15} color="#080808" />
        </button>
      </Link>
      <div style={{ padding:'14px' }}>
        <Link to={`/products/${product.slug}`} style={{ textDecoration:'none' }}>
          <h3 className="line-clamp-2" style={{ color:'#E0E0E0', fontSize:'13px', fontWeight:'500', marginBottom:'4px', lineHeight:'1.4' }}>{product.name}</h3>
        </Link>
        <p style={{ color:'#505050', fontSize:'12px', marginBottom:'8px' }}>{product.vendor?.businessName || product.vendor?.name}</p>
        {product.ratingsCount > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px' }}>
            <Star size={10} fill="#F5A623" color="#F5A623" />
            <span style={{ color:'#686868', fontSize:'11px' }}>{product.ratingsAverage?.toFixed(1)} ({product.ratingsCount})</span>
          </div>
        )}
        <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
          <span style={{ color:'#F5A623', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'15px' }}>₹{product.effectivePrice?.toLocaleString('en-IN')}</span>
          {product.baseMrp > product.basePrice && (
            <span style={{ color:'#404040', fontSize:'12px', textDecoration:'line-through' }}>₹{product.baseMrp?.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
