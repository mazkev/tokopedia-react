import { useState } from 'react';

export default function AuthPage({ mode, onLogin, onRegister, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin({ email, password });
    } else {
      onRegister({ name, email, password });
    }
  };

  return (
    <div className="auth-page-container animate-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '14px' }}>
            <img src="/tokopedei-icon.svg" alt="Tokopedei" className="logo-icon" style={{ width: '40px', height: '40px' }} />
            <div>Toko<span>pedei</span></div>
          </div>
          <h2>{mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}</h2>
          <p>{mode === 'login' ? 'Belum punya akun Tokopedei?' : 'Sudah punya akun Tokopedei?'} <span className="switch-link" onClick={onSwitch}>{mode === 'login' ? 'Daftar' : 'Masuk'}</span></p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                placeholder="Contoh: Kevin Pratama" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          )}
          <div className="form-group">
            <label>Nomor HP atau Email</label>
            <input 
              type="email" 
              placeholder="Contoh: email@tokopedei.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Kata Sandi</label>
            <input 
              type="password" 
              placeholder="Min. 8 karakter" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn-auth-submit">
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <div className="auth-divider">
          <span>atau masuk dengan</span>
        </div>

        <div className="social-auth">
          <button className="btn-social google">Google</button>
          <button className="btn-social facebook">Facebook</button>
        </div>

        <p className="auth-footer">
          Dengan mendaftar, saya menyetujui <br/>
          <span>Syarat & Ketentuan</span> serta <span>Kebijakan Privasi</span>
        </p>
      </div>
    </div>
  );
}
