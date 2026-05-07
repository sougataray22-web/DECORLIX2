import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import { Mail, Smartphone, ArrowRight, ShieldCheck, Store, ChevronRight, User } from 'lucide-react';

export default function LoginPage() {
  const [step,       setStep]       = useState('ident');
  const [method,     setMethod]     = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [otp,        setOtp]        = useState('');
  const [role,       setRole]       = useState('customer');
  const [isRegister, setIsRegister] = useState(false);
  const { sendOtp, verifyOtp, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return toast.error('Enter your email or phone');
    const res = await sendOtp(identifier.trim(), method, isRegister ? 'register' : 'login');
    if (res.ok) { toast.success(res.message); setStep('otp'); }
    else toast.error(res.message);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    const res = await verifyOtp(identifier.trim(), method, otp, role);
    if (res.ok) { toast.success('Welcome!'); navigate(res.redirectPath || '/'); }
    else toast.error(res.message);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080808', display:'flex', fontFamily:"'Outfit',sans-serif" }}>
      {/* Left panel */}
      <div style={{ flex:1, display:'none', flexDirection:'column', justifyContent:'space-between', padding:'48px', background:'linear-gradient(135deg,#111111,#0d0d0d)', borderRight:'1px solid rgba(255,255,255,0.06)', position:'relative', overflow:'hidden' }} className="lg-panel">
        <style>{`
          @media(min-width:1024px){ .lg-panel{display:flex!important} .auth-right{max-width:460px!important} }
          .otp-input { text-align:center; font-size:28px; letter-spacing:16px; font-family:'Syne',sans-serif; font-weight:700; }
          .method-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; border-radius:10px; font-size:13px; font-weight:500; transition:all .18s; cursor:pointer; border:none; }
        `}</style>
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:'-80px', left:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'260px', height:'260px', borderRadius:'50%', background:'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'64px' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Store size={20} color="#080808" />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'18px', color:'#F0F0F0' }}>
              {process.env.REACT_APP_STORE_NAME || 'MultiVend'}
            </span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'42px', fontWeight:'800', color:'#F0F0F0', lineHeight:'1.15', letterSpacing:'-0.03em', marginBottom:'20px' }}>
            The smarter<br />way to sell<br /><span style={{ color:'#F5A623' }}>& shop.</span>
          </h1>
          <p style={{ color:'#686868', fontSize:'15px', lineHeight:'1.7', maxWidth:'360px' }}>
            One platform. Multiple vendors. Seamless experience for customers and sellers alike.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {[
            { label:'Secure OTP Login', desc:'No passwords. Just your email or phone.' },
            { label:'Multi-Vendor Market', desc:'Shop from hundreds of verified vendors.' },
            { label:'Real-time Tracking', desc:'Track every order from checkout to door.' },
          ].map((f) => (
            <div key={f.label} style={{ display:'flex', alignItems:'flex-start', gap:'14px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#F5A623', marginTop:'7px', flexShrink:0 }} />
              <div>
                <p style={{ color:'#F0F0F0', fontSize:'14px', fontWeight:'600', marginBottom:'2px' }}>{f.label}</p>
                <p style={{ color:'#686868', fontSize:'13px' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right" style={{ width:'100%', maxWidth:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
        <div style={{ width:'100%', maxWidth:'400px' }}>
          {/* Mobile logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'48px' }} className="mobile-logo">
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#F5A623', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Store size={18} color="#080808" />
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'17px', color:'#F0F0F0' }}>
              {process.env.REACT_APP_STORE_NAME || 'MultiVend'}
            </span>
          </div>

          <div style={{ marginBottom:'32px' }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'28px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.03em', marginBottom:'6px' }}>
              {isRegister ? 'Create account' : 'Welcome back'}
            </h2>
            <p style={{ color:'#686868', fontSize:'14px' }}>
              {step === 'ident' ? `Enter your ${method} to continue` : `OTP sent to ${identifier}`}
            </p>
          </div>

          {step === 'ident' ? (
            <form onSubmit={handleSend}>
              {/* Method toggle */}
              <div style={{ display:'flex', background:'#141414', borderRadius:'12px', padding:'4px', marginBottom:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { key:'email', label:'Email', Icon:Mail },
                  { key:'phone', label:'Phone', Icon:Smartphone },
                ].map(({ key, label, Icon }) => (
                  <button key={key} type="button" onClick={() => setMethod(key)}
                    className="method-btn"
                    style={{ background: method===key ? '#F5A623' : 'transparent', color: method===key ? '#080808' : '#686868', fontWeight: method===key ? '700' : '500' }}>
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>

              <input
                type={method==='email' ? 'email' : 'tel'}
                placeholder={method==='email' ? 'you@example.com' : '+91 98765 43210'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="inp"
                style={{ marginBottom:'16px' }}
                required
              />

              {isRegister && (
                <div style={{ display:'flex', background:'#141414', borderRadius:'12px', padding:'4px', marginBottom:'16px', border:'1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { key:'customer', label:'Customer', Icon:User },
                    { key:'vendor',   label:'Vendor',   Icon:Store },
                  ].map(({ key, label, Icon }) => (
                    <button key={key} type="button" onClick={() => setRole(key)}
                      className="method-btn"
                      style={{ background: role===key ? '#F5A623' : 'transparent', color: role===key ? '#080808' : '#686868', fontWeight: role===key ? '700' : '500' }}>
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width:'100%', background: loading ? '#2a2a2a' : '#F5A623', color: loading ? '#686868' : '#080808', border:'none', borderRadius:'12px', padding:'14px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s', letterSpacing:'0.01em' }}>
                {loading ? 'Sending OTP…' : 'Continue'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <div style={{ background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:'12px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <ShieldCheck size={16} color="#F5A623" />
                <p style={{ color:'rgba(245,166,35,0.9)', fontSize:'13px', lineHeight:'1.4' }}>
                  Enter the 6-digit code sent to <strong>{identifier}</strong>
                </p>
              </div>

              <input
                type="text" inputMode="numeric" maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                className="inp otp-input"
                style={{ textAlign:'center', fontSize:'28px', letterSpacing:'16px', fontFamily:"'Syne',sans-serif", fontWeight:'700', marginBottom:'16px' }}
                required
              />

              <button type="submit" disabled={loading}
                style={{ width:'100%', background: loading ? '#2a2a2a' : '#F5A623', color: loading ? '#686868' : '#080808', border:'none', borderRadius:'12px', padding:'14px', fontFamily:"'Syne',sans-serif", fontWeight:'700', fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all .2s', marginBottom:'12px' }}>
                {loading ? 'Verifying…' : 'Verify & Enter'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <button type="button" onClick={() => setStep('ident')}
                style={{ width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'#686868', borderRadius:'12px', padding:'12px', fontFamily:"'Outfit',sans-serif", fontSize:'14px', cursor:'pointer', transition:'all .2s' }}>
                ← Change {method}
              </button>
            </form>
          )}

          <div style={{ marginTop:'28px', textAlign:'center' }}>
            <span style={{ color:'#686868', fontSize:'14px' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsRegister(!isRegister); setStep('ident'); }}
                style={{ background:'none', border:'none', color:'#F5A623', fontWeight:'600', fontSize:'14px', cursor:'pointer', padding:'0' }}>
                {isRegister ? 'Sign in' : 'Register free'}
              </button>
            </span>
          </div>

          <p style={{ marginTop:'32px', textAlign:'center', color:'#363636', fontSize:'12px' }}>
            Secured with one-time password · No passwords stored
          </p>
        </div>
      </div>
    </div>
  );
}
