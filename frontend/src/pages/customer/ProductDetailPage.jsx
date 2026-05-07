import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useCartStore from '../../context/cartStore';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Star, Truck, Shield, RotateCcw, ArrowLeft, Plus, Minus, Store, Zap } from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [mainImg,   setMainImg]   = useState(0);
  const [selVars,   setSelVars]   = useState({});
  const [qty,       setQty]       = useState(1);

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then(r => setProduct(r.data.product))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!product) return null;

  const matchedVar = product.variations?.find(v =>
    Object.entries(selVars).every(([k,val]) => (v.attributes?.get?.(k)||v.attributes?.[k]) === val)
  );
  const price = matchedVar ? matchedVar.price : product.basePrice;
  const mrp   = matchedVar ? matchedVar.mrp   : product.baseMrp;
  const stock = matchedVar ? matchedVar.stock  : product.baseStock;
  const discount = mrp > price ? Math.round(((mrp-price)/mrp)*100) : 0;
  const allSelected = product.variationAxes?.every(ax => selVars[ax]) ?? true;
  const images = matchedVar?.images?.length ? matchedVar.images : product.images;

  const axisOptions = {};
  product.variationAxes?.forEach(ax => {
    axisOptions[ax] = [...new Set(product.variations?.map(v=>v.attributes?.[ax]).filter(Boolean))];
  });

  const handleCart = () => {
    if (!allSelected) return toast.error('Please select all options');
    if (!stock) return toast.error('Out of stock');
    addItem(product, qty, matchedVar?.sku||null, selVars);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => { handleCart(); navigate('/checkout'); };

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif" }}>
      <style>{`
        .img-thumb{width:60px;height:60px;border-radius:10px;object-fit:cover;cursor:pointer;border:2px solid rgba(255,255,255,0.07);transition:all .18s;flex-shrink:0}
        .img-thumb.active,.img-thumb:hover{border-color:#F5A623}
        .var-btn{padding:8px 16px;border-radius:9px;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;border:1px solid rgba(255,255,255,0.1);background:transparent;color:#A0A0A0;font-family:'Outfit',sans-serif}
        .var-btn:hover{border-color:rgba(255,255,255,0.2);color:#E0E0E0}
        .var-btn.sel{border-color:#F5A623;background:rgba(245,166,35,0.1);color:#F5A623;font-weight:600}
        .trust-pill{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 10px;background:#111;border:1px solid rgba(255,255,255,0.07);border-radius:12px;flex:1;font-size:12px;color:#686868;text-align:center}
      `}</style>

      {/* Breadcrumb */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'12px 24px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', gap:'8px' }}>
          <Link to="/" style={{ color:'#686868', fontSize:'13px', textDecoration:'none' }}>Home</Link>
          <span style={{ color:'#363636' }}>/</span>
          <Link to="/products" style={{ color:'#686868', fontSize:'13px', textDecoration:'none' }}>Products</Link>
          <span style={{ color:'#363636' }}>/</span>
          <span style={{ color:'#F0F0F0', fontSize:'13px' }} className="line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px', alignItems:'start' }}>

          {/* Images */}
          <div>
            <div style={{ aspectRatio:'1', background:'#111', borderRadius:'20px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', marginBottom:'12px', position:'relative' }}>
              <img src={images?.[mainImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s' }} />
              {discount > 0 && (
                <div style={{ position:'absolute', top:'16px', left:'16px', background:'#FF4D4D', color:'white', fontSize:'12px', fontWeight:'800', padding:'5px 10px', borderRadius:'8px', fontFamily:"'Syne',sans-serif" }}>
                  -{discount}% OFF
                </div>
              )}
            </div>
            {images?.length > 1 && (
              <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
                {images.map((img,i) => (
                  <img key={i} src={img} alt="" className={`img-thumb${i===mainImg?' active':''}`} onClick={() => setMainImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            {product.brand && <span style={{ color:'#686868', fontSize:'13px', fontWeight:'500', letterSpacing:'.04em', textTransform:'uppercase' }}>{product.brand}</span>}

            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'28px', fontWeight:'800', color:'#F0F0F0', lineHeight:'1.2', letterSpacing:'-0.03em', margin:0 }}>
              {product.name}
            </h1>

            {product.ratingsCount > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ display:'flex', gap:'2px' }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill={s<=Math.round(product.ratingsAverage)?'#F5A623':'none'} color={s<=Math.round(product.ratingsAverage)?'#F5A623':'#363636'} />
                  ))}
                </div>
                <span style={{ color:'#686868', fontSize:'13px' }}>{product.ratingsAverage?.toFixed(1)} ({product.ratingsCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display:'flex', alignItems:'baseline', gap:'12px' }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:'36px', fontWeight:'800', color:'#F5A623', letterSpacing:'-0.04em' }}>
                ₹{price?.toLocaleString('en-IN')}
              </span>
              {mrp > price && (
                <span style={{ fontSize:'18px', color:'#404040', textDecoration:'line-through' }}>₹{mrp?.toLocaleString('en-IN')}</span>
              )}
              {discount > 0 && (
                <span style={{ background:'rgba(45,216,122,0.1)', color:'#2DD87A', border:'1px solid rgba(45,216,122,0.25)', borderRadius:'8px', fontSize:'12px', fontWeight:'700', padding:'3px 8px' }}>
                  Save ₹{(mrp-price).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Variations */}
            {product.variationAxes?.map(ax => (
              <div key={ax}>
                <p style={{ fontSize:'13px', fontWeight:'600', color:'#A0A0A0', marginBottom:'10px', textTransform:'capitalize', letterSpacing:'.03em' }}>
                  {ax}: {selVars[ax] && <span style={{ color:'#F5A623' }}>{selVars[ax]}</span>}
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {axisOptions[ax]?.map(val => (
                    <button key={val} className={`var-btn${selVars[ax]===val?' sel':''}`} onClick={() => setSelVars(s=>({...s,[ax]:val}))}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Stock indicator */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: stock>0?'#2DD87A':'#FF4D4D' }} />
              <span style={{ fontSize:'13px', color: stock>0?'#2DD87A':'#FF4D4D', fontWeight:'600' }}>
                {stock>10 ? 'In Stock' : stock>0 ? `Only ${stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Qty */}
            <div>
              <p style={{ fontSize:'13px', fontWeight:'600', color:'#A0A0A0', marginBottom:'10px' }}>Quantity</p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'#141414', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'4px' }}>
                <button onClick={() => setQty(q=>Math.max(1,q-1))}
                  style={{ width:'34px', height:'34px', borderRadius:'9px', border:'none', background:'transparent', color:'#A0A0A0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#F0F0F0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#A0A0A0'; }}>
                  <Minus size={15} />
                </button>
                <span style={{ width:'36px', textAlign:'center', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'16px', color:'#F0F0F0' }}>{qty}</span>
                <button onClick={() => setQty(q=>Math.min(stock,q+1))}
                  style={{ width:'34px', height:'34px', borderRadius:'9px', border:'none', background:'transparent', color:'#A0A0A0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#F0F0F0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#A0A0A0'; }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={handleCart} disabled={!stock}
                style={{ flex:1, background: stock?'transparent':'#1a1a1a', border: stock?'1px solid #F5A623':'1px solid rgba(255,255,255,0.07)', color: stock?'#F5A623':'#505050', borderRadius:'12px', padding:'14px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', cursor: stock?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s' }}
                onMouseEnter={e => { if(stock) { e.currentTarget.style.background='rgba(245,166,35,0.08)'; }}}
                onMouseLeave={e => { if(stock) { e.currentTarget.style.background='transparent'; }}}>
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={!stock}
                style={{ flex:1, background: stock?'#F5A623':'#1a1a1a', border:'none', color: stock?'#080808':'#505050', borderRadius:'12px', padding:'14px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'14px', cursor: stock?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s' }}>
                <Zap size={16} /> Buy Now
              </button>
            </div>

            {/* Sold by */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 16px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(245,166,35,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Store size={16} color="#F5A623" />
              </div>
              <div>
                <p style={{ color:'#505050', fontSize:'11px', marginBottom:'2px', letterSpacing:'.03em', textTransform:'uppercase', fontWeight:'600' }}>Sold by</p>
                <p style={{ color:'#E0E0E0', fontSize:'14px', fontWeight:'600' }}>{product.vendor?.businessName||product.vendor?.name}</p>
              </div>
            </div>

            {/* Trust pills */}
            <div style={{ display:'flex', gap:'8px' }}>
              {[
                { Icon:Truck,     label: product.freeShipping?'Free Delivery':`₹${product.shippingCharges} Shipping` },
                { Icon:Shield,    label:'Secure Payment' },
                { Icon:RotateCcw, label:'7-Day Returns' },
              ].map(({ Icon, label }) => (
                <div key={label} className="trust-pill">
                  <Icon size={16} color="#F5A623" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop:'48px', background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'28px' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'18px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.025em', marginBottom:'16px' }}>Product Description</h2>
          <p style={{ color:'#A0A0A0', lineHeight:'1.75', fontSize:'14px', whiteSpace:'pre-line' }}>{product.description}</p>
        </div>

        {product.tags?.length > 0 && (
          <div style={{ marginTop:'16px', display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {product.tags.map(t => (
              <Link key={t} to={`/products?search=${t}`}
                style={{ padding:'5px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'99px', color:'#686868', fontSize:'12px', textDecoration:'none', transition:'all .18s' }}
                onMouseEnter={e => { e.currentTarget.style.color='#F5A623'; e.currentTarget.style.borderColor='rgba(245,166,35,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='#686868'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}>
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const PageLoader = () => (
  <div style={{ minHeight:'100vh', background:'#080808', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ width:'32px', height:'32px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
  </div>
);
