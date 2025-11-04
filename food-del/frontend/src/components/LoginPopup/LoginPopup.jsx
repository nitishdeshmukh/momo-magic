// frontend/src/components/LoginPopup/LoginPopup.jsx
import React, { useContext, useEffect, useRef, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {
  const { token, setToken, url, loadCartData } = useContext(StoreContext)

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // "phone" | "otp"
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Abort controllers to cancel in-flight requests when a new one starts
  const otpReqAbortRef = useRef(null)
  const verifyAbortRef = useRef(null)

  // 1) If a token exists at any point, close the modal. This kills the race.
  useEffect(() => {
    if (token) setShowLogin(false)
  }, [token, setShowLogin])

  // cooldown timer for resend
  const startCooldown = (seconds = 60) => {
    const s = Number(seconds) || 60
    setCooldown(s)
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendOtp = async (e) => {
    e.preventDefault()
    if (!phone.startsWith('+')) {
      toast.error('Use full phone format like +91XXXXXXXXXX')
      return
    }
    if (cooldown > 0 || busy) return

    // cancel any prior OTP request
    if (otpReqAbortRef.current) otpReqAbortRef.current.abort()
    otpReqAbortRef.current = new AbortController()

    setBusy(true)
    try {
      const res = await axios.post(
        `${url}/api/sms/request`,
        { phoneNumber: phone },
        { signal: otpReqAbortRef.current.signal, validateStatus: () => true }
      )

      if (res.data?.success) {
        setStep('otp')
        startCooldown(Number(res.data.cooldownSeconds || 60))
        toast.success('OTP sent via SMS')
      } else {
        if (typeof res.data?.remaining === 'number') {
          startCooldown(res.data.remaining)
        }
        toast.error(res.data?.message || 'Could not send OTP')
      }
    } catch (err) {
      // Ignore cancellations; only surface real failures
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error(err)
        toast.error('Failed to send OTP')
      }
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!otp.trim()) return

    // cancel any previous verify to prevent double-submit races
    if (verifyAbortRef.current) verifyAbortRef.current.abort()
    verifyAbortRef.current = new AbortController()

    setBusy(true)
    try {
      const res = await axios.post(
        `${url}/api/sms/verify`,
        { phoneNumber: phone, otp: otp.trim() },
        { signal: verifyAbortRef.current.signal, validateStatus: () => true }
      )

      if (res.data?.success && res.data?.token) {
        // Set token first; the token effect will auto-close the modal even if some late error arrives.
        setToken(res.data.token)
        localStorage.setItem('token', res.data.token)
        await loadCartData({ token: res.data.token })
        toast.success('Logged in successfully')
        // Optional: immediate close for snappy UX (effect is the real guarantee)
        setShowLogin(false)
      } else {
        // After a success, the server clears OTP. Any second submit will say "Request a new OTP".
        toast.error(res.data?.message || 'Invalid OTP')
      }
    } catch (err) {
      // If a late request gets canceled because the modal closed, do NOT scream “failed.”
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error(err)
        toast.error('Verification failed')
      }
    } finally {
      setBusy(false)
    }
  }

  // Clean up on unmount: cancel outstanding requests
  useEffect(() => {
    return () => {
      if (otpReqAbortRef.current) otpReqAbortRef.current.abort()
      if (verifyAbortRef.current) verifyAbortRef.current.abort()
    }
  }, [])

  return (
    <div className='login-popup'>
      <form onSubmit={step === 'phone' ? sendOtp : verifyOtp} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{step === 'phone' ? 'Sign in with phone' : 'Enter OTP'}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>

        <div className="login-popup-inputs">
          {step === 'phone' ? (
            <input
              name='phone'
              type="tel"
              placeholder='+91XXXXXXXXXX'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          ) : (
            <input
              name='otp'
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder='OTP'
              value={otp}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '')
                setOtp(digits)
              }}
              required
            />
          )}
        </div>

        {step === 'phone' ? (
          <button disabled={busy || cooldown > 0}>
            {cooldown > 0 ? `Send OTP (${cooldown}s)` : 'Send OTP'}
          </button>
        ) : (
          <>
            <button disabled={busy || otp.length < 4}>Verify</button>
            <p style={{ marginTop: 8 }}>
              Didn’t get it?{' '}
              <span
                style={{ color: cooldown > 0 ? '#888' : '#007bff', cursor: cooldown > 0 ? 'not-allowed' : 'pointer' }}
                onClick={cooldown > 0 ? undefined : sendOtp}
                aria-disabled={cooldown > 0}
              >
                Resend OTP {cooldown > 0 ? `in ${cooldown}s` : ''}
              </span>
            </p>
          </>
        )}
      </form>
    </div>
  )
}

export default LoginPopup
