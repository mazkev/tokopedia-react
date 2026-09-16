import { useState, useRef, useEffect } from 'react';

export default function AuthPage({ mode: initialMode, onLogin, onRegister, onSwitch, onResetPassword, addNotification }) {
  const [mode, setMode] = useState(initialMode || 'login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Verification States
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState('register'); // 'register' | 'forgot'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'new_password'

  const inputRefs = useRef([]);

  // Sync mode prop when changed externally
  useEffect(() => {
    setMode(initialMode || 'login');
    setResetStep('request');
    setOtpModalOpen(false);
  }, [initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpModalOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpModalOpen, timer]);

  // Generate 6-digit OTP and trigger simulated notification
  const triggerOtp = (purpose) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setTimer(60);
    setCanResend(false);
    setOtpPurpose(purpose);
    setOtpModalOpen(true);

    if (addNotification) {
      addNotification(`📩 [OTP TOKOPEDEI] Kode verifikasi Anda: ${code} (Berlaku 5 menit)`);
    }

    // Auto-focus first digit after modal mounts
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 150);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin({ email, password });
    } else if (mode === 'register') {
      // Trigger OTP verification before finalizing registration
      triggerOtp('register');
    } else if (mode === 'forgot') {
      if (resetStep === 'request') {
        triggerOtp('forgot');
      } else if (resetStep === 'new_password') {
        if (newPassword !== confirmPassword) {
          if (addNotification) addNotification('⚠️ Konfirmasi kata sandi tidak cocok!');
          return;
        }
        if (newPassword.length < 6) {
          if (addNotification) addNotification('⚠️ Kata sandi minimal 6 karakter!');
          return;
        }
        if (onResetPassword) {
          onResetPassword(email, newPassword);
        }
        setMode('login');
        setResetStep('request');
      }
    }
  };

  // Handle individual digit input
  const handleDigitChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1); // Take last character typed
    setOtpDigits(newDigits);
    setOtpError('');

    // Auto advance focus to next box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Paste of full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    setOtpError('');

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Quick Demo Auto-fill Helper
  const handleAutoFillDemo = () => {
    if (!generatedOtp) return;
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setOtpError('');
    inputRefs.current[5]?.focus();
  };

  // Verify OTP submission
  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length < 6) {
      setOtpError('Masukkan 6 digit kode verifikasi lengkap.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setOtpError('Kode OTP salah atau telah kadaluarsa. Coba lagi.');
      return;
    }

    // OTP Matched Successfully!
    setOtpModalOpen(false);

    if (otpPurpose === 'register') {
      if (addNotification) {
        addNotification('🎉 Verifikasi Email Berhasil! Akun Anda telah diaktifkan.');
      }
      onRegister({ name, email, password });
    } else if (otpPurpose === 'forgot') {
      if (addNotification) {
        addNotification('✅ Identitas terverifikasi. Silakan masukkan kata sandi baru Anda.');
      }
      setResetStep('new_password');
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    triggerOtp(otpPurpose);
    if (addNotification) {
      addNotification('🔄 Kode verifikasi baru telah dikirim!');
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

          <h2>
            {mode === 'login' && 'Masuk ke Akun'}
            {mode === 'register' && 'Daftar Sekarang'}
            {mode === 'forgot' && (resetStep === 'new_password' ? 'Setel Kata Sandi Baru' : 'Lupa Kata Sandi')}
          </h2>

          <p>
            {mode === 'login' && (
              <>Belum punya akun Tokopedei? <span className="switch-link" onClick={onSwitch}>Daftar</span></>
            )}
            {mode === 'register' && (
              <>Sudah punya akun Tokopedei? <span className="switch-link" onClick={onSwitch}>Masuk</span></>
            )}
            {mode === 'forgot' && (
              <>Kembali ke halaman <span className="switch-link" onClick={() => { setMode('login'); setResetStep('request'); }}>Masuk</span></>
            )}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleFormSubmit}>
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

          {mode !== 'forgot' || resetStep === 'request' ? (
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
          ) : null}

          {mode === 'login' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Kata Sandi</label>
                <span 
                  className="switch-link" 
                  style={{ fontSize: '12px', fontWeight: 600 }}
                  onClick={() => { setMode('forgot'); setResetStep('request'); }}
                >
                  Lupa kata sandi?
                </span>
              </div>
              <input 
                type="password" 
                placeholder="Min. 6 karakter" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label>Kata Sandi</label>
              <input 
                type="password" 
                placeholder="Min. 6 karakter" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          )}

          {mode === 'forgot' && resetStep === 'new_password' && (
            <>
              <div className="form-group">
                <label>Kata Sandi Baru</label>
                <input 
                  type="password" 
                  placeholder="Min. 6 karakter" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Konfirmasi Kata Sandi Baru</label>
                <input 
                  type="password" 
                  placeholder="Ketik ulang kata sandi baru" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-auth-submit">
            {mode === 'login' && 'Masuk'}
            {mode === 'register' && 'Daftar & Verifikasi OTP'}
            {mode === 'forgot' && (resetStep === 'new_password' ? 'Simpan Kata Sandi Baru' : 'Kirim Kode Verifikasi OTP')}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="auth-divider">
              <span>atau masuk dengan</span>
            </div>

            <div className="social-auth">
              <button 
                type="button"
                className="btn-social google"
                onClick={() => addNotification && addNotification("Mode Simulasi: Pendaftaran via Google")}
              >
                Google
              </button>
              <button 
                type="button"
                className="btn-social facebook"
                onClick={() => addNotification && addNotification("Mode Simulasi: Pendaftaran via Facebook")}
              >
                Facebook
              </button>
            </div>

            <p className="auth-footer">
              Dengan mendaftar, saya menyetujui <br/>
              <span>Syarat & Ketentuan</span> serta <span>Kebijakan Privasi Tokopedei</span>
            </p>
          </>
        )}
      </div>

      {/* MODAL VERIFIKASI OTP 6 DIGIT */}
      {otpModalOpen && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-card animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="otp-icon-header">
              <div className="otp-icon-badge">📩</div>
              <h3>Verifikasi Kode OTP</h3>
              <p className="otp-subtitle">
                Masukkan 6 digit kode verifikasi yang kami kirimkan ke: <br/>
                <b>{email || 'email@tokopedei.com'}</b>
              </p>
            </div>

            {/* In-App Simulator Banner */}
            <div className="otp-simulator-hint">
              <div className="simulator-badge">⚡ SIMULATOR IN-APP</div>
              <p>Kode OTP aktif Anda: <span className="otp-code-highlight">{generatedOtp}</span></p>
              <button 
                type="button" 
                className="btn-otp-demo-fill"
                onClick={handleAutoFillDemo}
              >
                💡 Isi Otomatis Kode Demo
              </button>
            </div>

            {/* 6-Digit Input Boxes */}
            <form onSubmit={handleVerifyOtp}>
              <div className="otp-input-row" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input 
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text" 
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`otp-digit-input ${digit ? 'filled' : ''}`}
                    autoComplete="off"
                  />
                ))}
              </div>

              {otpError && (
                <p className="otp-error-message">⚠️ {otpError}</p>
              )}

              <button 
                type="submit" 
                className="btn-otp-verify"
                disabled={otpDigits.join('').length < 6}
              >
                Verifikasi Sekarang
              </button>
            </form>

            <div className="otp-footer">
              <div className="otp-timer-row">
                {!canResend ? (
                  <span className="otp-timer-text">
                    Kirim ulang kode dalam <b>{timer}s</b>
                  </span>
                ) : (
                  <button 
                    type="button" 
                    className="btn-otp-resend active"
                    onClick={handleResendOtp}
                  >
                    🔄 Kirim Ulang Kode OTP
                  </button>
                )}
              </div>

              <button 
                type="button" 
                className="btn-otp-cancel"
                onClick={() => setOtpModalOpen(false)}
              >
                Batal / Ganti Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
