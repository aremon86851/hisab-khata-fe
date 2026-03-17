import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { getApiError } from '../../utils/helpers';
import { Input, Button, PinInput } from '../../components/shared';
import type { TRole } from '../../types';

const SHOP_TYPES = ['মুদি 🛒','ফার্মেসি 💊','কাপড় 👔','মাংস 🥩','সবজি 🥦','মোবাইল 📱','বেকারি 🍞','সেলুন ✂️','অন্যান্য ➕'];

export default function SignupPage() {
  const [step,       setStep]      = useState<'role'|'form'|'otp'|'pin'>('role');
  const [role,       setRole]      = useState<'shopkeeper'|'customer'>('shopkeeper');
  const [shopName,   setShopName]  = useState('');
  const [shopType,   setShopType]  = useState('');
  const [name,       setName]      = useState('');
  const [mobile,     setMobile]    = useState('');
  const [password,   setPassword]  = useState('');
  const [otp,        setOtp]       = useState('');
  const [pin,        setPin]       = useState('');
  const [pinConfirm, setPinConfirm]= useState('');
  const [tempToken,  setTempToken] = useState('');
  const [error,      setError]     = useState('');
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const skMut = useMutation({
    mutationFn: () => authApi.shopkeeperSignup({ shopName, mobile, password }),
    onSuccess: () => { setStep('otp'); setError(''); },
    onError: (e) => setError(getApiError(e)),
  });
  const cuMut = useMutation({
    mutationFn: () => authApi.customerSignup({ name, mobile }),
    onSuccess: () => { setStep('otp'); setError(''); },
    onError: (e) => setError(getApiError(e)),
  });
  const otpMut = useMutation({
    mutationFn: () => authApi.verifyOtp({ mobile, otp, purpose: 'REGISTER' }),
    onSuccess: ({ data }: any) => { setTempToken(data.data.tempToken); setStep('pin'); setError(''); },
    onError: (e) => setError(getApiError(e)),
  });
  const pinMut = useMutation({
    mutationFn: () => authApi.setPin({ mobile, pin, token: tempToken }),
    onSuccess: ({ data }: any) => {
      login(data.data.accessToken, data.data.role as TRole, data.data.shopId);
      navigate(data.data.role === 'SHOPKEEPER' ? '/shopkeeper' : '/customer');
    },
    onError: (e) => setError(getApiError(e)),
  });

  const handleRegister = () => { setError(''); role==='shopkeeper'?skMut.mutate():cuMut.mutate(); };
  const steps = ['role','form','otp','pin'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center"><div className="text-5xl mb-2">📒</div><h1 className="text-2xl font-extrabold text-white">HisabKhata</h1></div>

      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s,i)=>(
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step===s?'bg-teal-600 text-white scale-110':stepIdx>i?'bg-teal-800 text-teal-300':'bg-slate-800 text-slate-500'}`}>
                {i+1}
              </div>
              {i<3&&<div className={`w-6 h-px ${stepIdx>i?'bg-teal-600':'bg-slate-700'}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 animate-slide-up">

          {step==='role' && (
            <div>
              <h2 className="text-white font-bold text-lg mb-4">আপনি কে?</h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{r:'shopkeeper' as const,icon:'🏪',label:'দোকানদার'},{r:'customer' as const,icon:'👤',label:'Customer'}].map(({r,icon,label})=>(
                  <button key={r} onClick={()=>setRole(r)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${role===r?'border-teal-500 bg-teal-900/30':'border-slate-700'}`}>
                    <div className="text-3xl mb-1">{icon}</div>
                    <div className="text-white text-sm font-bold">{label}</div>
                  </button>
                ))}
              </div>
              <Button onClick={()=>setStep('form')} className="w-full">এগিয়ে যান →</Button>
              <div className="mt-3 text-center"><Link to="/login" className="text-slate-500 text-xs hover:text-slate-300">ইতিমধ্যে account আছে? লগইন করুন →</Link></div>
            </div>
          )}

          {step==='form' && (
            <div className="space-y-4">
              <h2 className="text-white font-bold text-lg">{role==='shopkeeper'?'🏪 দোকানের তথ্য':'👤 আপনার তথ্য'}</h2>
              {role==='shopkeeper' ? (
                <>
                  <Input label="দোকানের নাম*" value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="যেমন: রহিম স্টোর" />
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-2">দোকানের ধরন</label>
                    <div className="flex flex-wrap gap-2">
                      {SHOP_TYPES.map(t=>(
                        <button key={t} onClick={()=>setShopType(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                            ${shopType===t?'bg-teal-600 text-white border-teal-500':'border-slate-700 text-slate-400'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <Input label="মোবাইল নম্বর*" value={mobile} onChange={e=>setMobile(e.target.value)} type="tel" placeholder="01XXXXXXXXX" />
                  <Input label="Password*" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="কমপক্ষে ৬ অক্ষর" />
                </>
              ) : (
                <>
                  <Input label="আপনার নাম*" value={name} onChange={e=>setName(e.target.value)} placeholder="পুরো নাম লিখুন" />
                  <Input label="মোবাইল নম্বর*" value={mobile} onChange={e=>setMobile(e.target.value)} type="tel" placeholder="01XXXXXXXXX" />
                </>
              )}
              {error && <p className="text-red-400 text-xs bg-red-950/50 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={()=>setStep('role')} className="flex-1">← পিছনে</Button>
                <Button onClick={handleRegister} loading={skMut.isPending||cuMut.isPending} className="flex-1">OTP পান →</Button>
              </div>
            </div>
          )}

          {step==='otp' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">OTP যাচাই করুন</h2>
                <p className="text-slate-400 text-sm">{mobile} এ OTP পাঠানো হয়েছে</p>
              </div>
              <div className="flex gap-2 justify-center">
                {[0,1,2,3,4,5].map(i=>(
                  <input key={i} maxLength={1} value={otp[i]||''} id={`otp-${i}`}
                    onChange={e=>{
                      const v=e.target.value.replace(/\D/,'');
                      const a=otp.split(''); a[i]=v; setOtp(a.join(''));
                      if(v&&i<5)(document.getElementById(`otp-${i+1}`) as HTMLInputElement)?.focus();
                    }}
                    className="w-12 h-14 bg-slate-900 border-2 border-slate-600 focus:border-teal-500 rounded-xl text-center text-white text-xl font-mono font-bold outline-none transition-colors" />
                ))}
              </div>
              {error && <p className="text-red-400 text-xs bg-red-950/50 rounded-lg px-3 py-2">{error}</p>}
              <Button onClick={()=>{setError();otpMut.mutate();}} loading={otpMut.isPending} className="w-full" disabled={otp.length<6}>যাচাই করুন ✓</Button>
              <p className="text-center text-slate-500 text-xs">
                OTP আসেনি? <button className="text-teal-400 hover:underline" onClick={handleRegister}>পুনরায় পাঠান</button>
              </p>
            </div>
          )}

          {step==='pin' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-white font-bold text-lg mb-1">PIN সেট করুন</h2>
                <p className="text-slate-400 text-sm">দ্রুত লগইনের জন্য ৪ সংখ্যার PIN</p>
              </div>
              {pinConfirm===''
                ? <PinInput value={pin} onChange={v=>{setPin(v);if(v.length===4)setPinConfirm(' ');}} label="আপনার PIN দিন" />
                : <PinInput value={pinConfirm.trim()} onChange={setPinConfirm} label="PIN আবার দিন" />
              }
              {pinConfirm.trim().length>0 && pinConfirm.trim()!==pin && <p className="text-red-400 text-xs text-center">PIN মিলছে না</p>}
              {error && <p className="text-red-400 text-xs bg-red-950/50 rounded-lg px-3 py-2">{error}</p>}
              <Button onClick={()=>{setError('');pinMut.mutate();}} loading={pinMut.isPending}
                disabled={pin.length<4||pinConfirm.trim()!==pin} className="w-full">
                অ্যাকাউন্ট তৈরি করুন ✓
              </Button>
              <p className="text-center text-amber-400 text-xs">⚠️ PIN কাউকে বলবেন না</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
