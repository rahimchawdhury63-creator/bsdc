import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { ImageUploader } from '@components/ui/ImageUploader';
import { Input } from '@components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { createVerificationRequest } from '@/services/verification.service';

/** Verification application form with real ImgBB document image URL. */
export const VerificationForm = () => {
  const { firebaseUser } = useAuth();
  const [idType, setIdType] = useState<'nid' | 'birth_certificate'>('nid');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageUrls, setImageUrls] = useState<readonly string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!firebaseUser || !imageUrls[0]) { setMessage('Login and document image are required.'); return; }
    const result = await createVerificationRequest({ userId: firebaseUser.uid, idType, phoneNumber, idImageUrl: imageUrls[0] });
    setMessage(result.ok ? 'Verification request submitted.' : result.error);
  };

  return <section className="surface-card"><h1>Apply for verification</h1><div className="auth-form"><label className="form-label" htmlFor="id-type">ID type</label><select id="id-type" className="form-input" value={idType} onChange={(event) => setIdType(event.target.value as 'nid' | 'birth_certificate')}><option value="nid">NID</option><option value="birth_certificate">Birth certificate</option></select><Input id="phone-number" label="Phone number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} /><ImageUploader imageUrls={imageUrls} onChange={setImageUrls} /><Button type="button" onClick={() => void submit()}>Submit verification</Button>{message ? <p className="form-helper">{message}</p> : null}</div></section>;
};
