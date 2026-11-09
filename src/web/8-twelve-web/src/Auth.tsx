import { useState, type FormEvent } from 'react'
import { Brand, Icon } from './ui'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5089'

export function Auth({ register, navigate, notify }: { register: boolean; navigate: (route: string) => void; notify: (message: string) => void }) {
  const [values, setValues] = useState({ name: '', username: '', email: '', password: '', confirm: '', identifier: '', terms: false, remember: false })
  const [visible, setVisible] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [forgot, setForgot] = useState(false)
  const set = (key: string, value: string | boolean) => setValues(previous => ({ ...previous, [key]: value }))
  const strength = [values.password.length >= 8, /[A-Z]/.test(values.password), /[0-9]/.test(values.password), /[^A-Za-z0-9]/.test(values.password)].filter(Boolean).length
  const [busy, setBusy] = useState(false)
  const call = async (path: string, body: object) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const detail = data.errors ? Object.values(data.errors).flat().join(' ') : ''
        return { ok: false, message: data.message || detail || 'Request failed.', data }
      }
      return { ok: true, message: data.message as string, data }
    } catch {
      return { ok: false, message: 'Cannot reach the server. Is the API running?', data: null }
    }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (forgot) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
    } else if (register) {
      if (!values.name.trim()) next.name = 'Full name is required.'
      if (!values.username.trim()) next.username = 'Username is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
      if (values.password.length < 8) next.password = 'Use at least 8 characters.'
      if (!values.confirm || values.password !== values.confirm) next.confirm = 'Passwords must match.'
      if (!values.terms) next.terms = 'Please accept the terms to continue.'
    } else {
      if (!values.identifier.trim()) next.identifier = 'Username or email is required.'
      if (!values.password) next.password = 'Password is required.'
    }
    setErrors(next)
    if (Object.keys(next).length) return
    if (forgot) { notify('Demo only: no reset email was sent.'); setForgot(false) }
    else if (register) {
      setBusy(true)
      const result = await call('register', { fullName: values.name.trim(), username: values.username.trim(), email: values.email.trim(), password: values.password })
      setBusy(false)
      if (!result.ok) { notify(result.message); return }
      notify('Account created! Please sign in.'); navigate('login')
    } else {
      setBusy(true)
      const result = await call('login', { identifier: values.identifier.trim(), password: values.password })
      setBusy(false)
      if (!result.ok) { notify(result.message); return }
      const storage = values.remember ? localStorage : sessionStorage
      storage.setItem('token', result.data.token)
      notify('Welcome back!'); navigate('dashboard')
    }
  }
  const field = (key: 'name' | 'username' | 'email' | 'identifier' | 'password' | 'confirm', label: string, placeholder: string, type = 'text') => <label className="form-field"><span>{label}</span><div className="input-wrap"><input id={`input-${key}`} type={type === 'password' && visible ? 'text' : type} value={values[key]} onChange={event => set(key, event.target.value)} placeholder={placeholder} aria-label={label} aria-invalid={!!errors[key]} />{type === 'password' && <button id={`btn-toggle-${key}`} type="button" className="password-toggle" aria-label={visible ? 'Hide passwords' : 'Show passwords'} onClick={() => setVisible(!visible)}><Icon name="eye" size={18} /></button>}</div>{errors[key] && <small className="field-error">{errors[key]}</small>}</label>
  return <div className="prototype auth-page">
    <div className="auth-aside"><Brand light /><div className="auth-aside-content"><div className="aside-sparkle">✦</div><span className="aside-label">THE SMARTER WAY TO MANAGE</span><h2>Everything your kiosk needs, all in one place.</h2><p>Keep your business moving with a clearer view of your products, customers, and sales.</p><div className="aside-card"><span>✦</span><div><strong>Made for everyday business</strong><small>Simple tools. Better decisions.</small></div></div></div><p className="aside-footer">© 8-Twelve Kiosk · Your neighborhood, made easier.</p></div>
    <main className="auth-main"><div className="auth-mobile-brand"><Brand /></div><div className="auth-card">
      <span className="eyebrow">WELCOME TO 8-TWELVE</span>
      <h1>{forgot ? 'Forgot password?' : register ? 'Create your account' : 'Welcome back'}</h1>
      <p className="auth-intro">{forgot ? 'Enter your email to simulate a password reset.' : register ? 'Join us and get started in just a few steps.' : 'Enter your details to continue to your dashboard.'}</p>
      <div className="demo-notice">Demo only · No real accounts or authentication</div>
      <form onSubmit={submit} noValidate>
        {forgot ? field('email', 'Email address', 'you@example.com', 'email') : register ? <>{field('name', 'Full name', 'Enter your full name')}{field('username', 'Username', 'Choose a username')}{field('email', 'Email address', 'you@example.com', 'email')}{field('password', 'Password', 'Create a password', 'password')}<div className="strength"><div><span style={{ width: `${strength * 25}%` }} /></div><small>Password strength: {['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'][strength]}</small></div>{field('confirm', 'Confirm password', 'Re-enter your password', 'password')}<label className="check"><input id="input-terms" type="checkbox" checked={values.terms} onChange={event => set('terms', event.target.checked)} /> <span>I agree to the <button id="btn-terms" type="button" className="text-button" onClick={() => notify('Demo terms: this prototype does not create an account.')}>Terms and Conditions</button></span></label>{errors.terms && <small className="field-error">{errors.terms}</small>}</> : <>{field('identifier', 'Username or email', 'Enter your username or email')}{field('password', 'Password', 'Enter your password', 'password')}<div className="auth-options"><label className="check"><input id="input-remember" type="checkbox" checked={values.remember} onChange={event => set('remember', event.target.checked)} /> Remember me</label><button id="btn-forgot-password" type="button" className="text-button" onClick={() => { setErrors({}); setForgot(true) }}>Forgot password?</button></div></>}
        <button id="btn-submit" className="primary-button full" type="submit" disabled={busy}>{forgot ? 'Simulate reset' : register ? 'Create account' : 'Sign in'} <span>→</span></button>
      </form>
      <p className="auth-switch">{forgot ? <button id="btn-back-to-signin" className="text-button" onClick={() => { setErrors({}); setForgot(false) }}>Back to sign in</button> : register ? <>Already have an account? <button id="btn-go-login" className="text-button" onClick={() => navigate('login')}>Sign in</button></> : <>New to 8-Twelve? <button id="btn-go-register" className="text-button" onClick={() => navigate('register')}>Create an account</button></>}</p>
      <button id="btn-explore-dashboard" className="subtle-link" onClick={() => navigate('dashboard')}>Explore the dashboard without signing in →</button>
    </div><p className="auth-bottom">A frontend prototype built for your neighborhood kiosk.</p></main>
  </div>
}
