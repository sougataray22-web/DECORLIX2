import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Clock, CheckCircle, XCircle, ArrowLeft, Store, FileText, RefreshCw } from 'lucide-react';

export default function VendorKYCPending() {
  const [kyc,     setKyc]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/kyc/my-kyc').then(r => setKyc(r.data.kyc)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    pending:  { Icon:Clock,         color:'#F5A623', bg:'rgba(245,166,35,0.08)',   border:'rgba(245,166,35,0.2)',  label:'Under Review',   desc:'Our team is reviewing your KYC documents. This usually takes 24–48 hours.' },
    approved: { Icon:CheckCircle,   color:'#2DD87A', bg:'rgba(45,216,122,0.08)',  border:'rgba(45,216,122,0.2)', label:'KYC Approved!',  desc:'Congratulations! Your account is approved. You can now start listing products.' },
    rejected: { Icon:XCircle,       color:'#FF4D4D', bg:'rgba(255,77,77,0.08)',   border:'rgba(255,77,77,0.2)',  label:'KYC Rejected',   desc:'Your application was rejected. Please review the reason and resubmit.' },
  };

  const cfg = statusConfig[kyc?.status] || statusConfig.pending;
  const { Icon } = cfg;

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'Outfit',sans-serif", display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      {loading ? (
        <div style={{ width:'32px', height:'32px', border:'3px solid rgba(245,166,35,0.2)', borderTopColor:'#F5A623', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      ) : (
        <div style={{ width:'100%', maxWidth:'440px', textAlign:'center' }}>
          {/* Status icon */}
          <div style={{ width:'96px', height:'96px', borderRadius:'50%', background:cfg.bg, border:`2px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px' }}>
            <Icon size={48} color={cfg.color} />
          </div>

          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:'30px', fontWeight:'800', color:'#F0F0F0', letterSpacing:'-0.04em', marginBottom:'10px' }}>
            {cfg.label}
          </h1>
          <p style={{ color:'#686868', fontSize:'15px', lineHeight:'1.6', marginBottom:'32px' }}>{cfg.desc}</p>

          {/* Rejection reason */}
          {kyc?.status === 'rejected' && kyc?.rejectionReason && (
            <div style={{ background:'rgba(255,77,77,0.07)', border:'1px solid rgba(255,77,77,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'24px', textAlign:'left' }}>
              <p style={{ color:'#FF4D4D', fontSize:'12px', fontWeight:'700', letterSpacing:'.04em', textTransform:'uppercase', marginBottom:'6px' }}>Rejection Reason</p>
              <p style={{ color:'#E0E0E0', fontSize:'14px', lineHeight:'1.5' }}>{kyc.rejectionReason}</p>
            </div>
          )}

          {/* KYC details card */}
          {kyc && (
            <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px', marginBottom:'24px', textAlign:'left' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <FileText size={15} color="#686868" />
                <span style={{ color:'#686868', fontSize:'13px', fontWeight:'600' }}>KYC Submission Details</span>
              </div>
              {[
                ['Business Name',   kyc.businessName],
                ['Submission #',    kyc.submissionCount],
                ['Status',          kyc.status],
                ['Submitted on',    new Date(kyc.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'13px' }}>
                  <span style={{ color:'#686868' }}>{label}</span>
                  <span style={{ color:'#E0E0E0', fontWeight:'500', textTransform:'capitalize' }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {kyc?.status === 'approved' && (
              <Link to="/vendor/dashboard" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'#F5A623', color:'#080808', padding:'14px', borderRadius:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', textDecoration:'none' }}>
                <Store size={16} /> Go to Dashboard
              </Link>
            )}
            {(kyc?.status === 'rejected' || !kyc) && (
              <Link to="/vendor/kyc" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'#F5A623', color:'#080808', padding:'14px', borderRadius:'12px', fontFamily:"'Syne',sans-serif", fontWeight:'800', fontSize:'15px', textDecoration:'none' }}>
                <RefreshCw size={16} /> Resubmit KYC
              </Link>
            )}
            {kyc?.status === 'pending' && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(245,166,35,0.07)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:'12px', padding:'14px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#F5A623', animation:'pulse 1.5s infinite' }} />
                <span style={{ color:'#F5A623', fontSize:'14px', fontWeight:'600' }}>Awaiting admin review…</span>
              </div>
            )}
            <Link to="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#686868', padding:'12px', borderRadius:'12px', fontFamily:"'Outfit',sans-serif", fontWeight:'500', fontSize:'14px', textDecoration:'none' }}>
              <ArrowLeft size={15} /> Back to Homepage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
