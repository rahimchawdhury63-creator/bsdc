import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { verifyAdminPasskey } from '@/services/admin.service';

/** Admin passkey page requested by the owner. */
export const PasskeyLogin = () => { const nav=useNavigate(); const [passkey,setPasskey]=useState(''); const [error,setError]=useState<string|null>(null); const submit=()=>{ if(verifyAdminPasskey(passkey)) nav('/admin',{replace:true}); else setError('Invalid admin passkey.'); }; return <section className="surface-card"><h1>Admin passkey</h1><Input id="admin-passkey" label="Passkey" type="password" value={passkey} onChange={(e)=>setPasskey(e.target.value)} /><Button type="button" onClick={submit}>Enter admin panel</Button>{error?<p className="form-error">{error}</p>:null}</section>; };
