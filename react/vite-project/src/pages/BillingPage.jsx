import { useEffect, useState } from 'react'
import { BadgeCheck, CreditCard, LoaderCircle, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../lib/api.js'

const plans = [
  {
    type: 'MONTHLY',
    name: 'Monthly',
    price: '₹799',
    cadence: 'per month',
    description: 'Flexible access, billed monthly.',
  },
  {
    type: 'ANNUALLY',
    name: 'Annual',
    price: '₹6,712',
    cadence: 'per year',
    description: 'Save 30% compared with monthly billing.',
  },
]

export default function BillingPage() {
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState('')
  const [error, setError] = useState('')
  const paymentStatus = searchParams.get('payment_link_status')

  useEffect(() => {
    let active = true
    apiRequest('/api/subscriptions/user', { token })
      .then((result) => {
        if (active) setSubscription(result)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token])

  const purchasePlan = async (planType) => {
    setError('')
    setSubmitting(planType)
    try {
      const result = await apiRequest(`/api/payment/${planType}`, { method: 'POST', token })
      if (!result?.payment_link_url) throw new Error('The payment provider did not return a payment link.')
      window.location.assign(result.payment_link_url)
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting('')
    }
  }

  return (
    <main className="page-content billing-page">
      <div className="page-heading">
        <div><p className="eyebrow">Workspace settings</p><h1>Plans & billing</h1><p className="page-description">Manage your ProjectFlow subscription.</p></div>
      </div>
      {paymentStatus && (
        <div className={paymentStatus.toLowerCase() === 'paid' ? 'success-banner' : 'notice-banner'} role="status">
          <strong>{paymentStatus.toLowerCase() === 'paid' ? 'Payment received' : 'Payment update'}</strong>
          <span>
            {paymentStatus.toLowerCase() === 'paid'
              ? 'Your plan will update after the payment confirmation is processed.'
              : 'Your payment has not been confirmed yet. Your subscription changes only after confirmation.'}
          </span>
        </div>
      )}
      {error && <div className="inline-error" role="alert"><p>{error}</p></div>}
      {loading ? (
        <div className="state-message"><LoaderCircle className="spin" size={22} /><p>Loading subscription…</p></div>
      ) : (
        <>
          <section className="current-plan-card">
            <div className="current-plan-icon"><CreditCard size={20} /></div>
            <div className="current-plan-copy">
              <p className="eyebrow">Current plan</p>
              <h2>{subscription?.planType || 'FREE'} <span className={subscription?.valid ? 'plan-status active' : 'plan-status'}>{subscription?.valid ? 'Active' : 'Inactive'}</span></h2>
              <p>
                {subscription?.subscriptionEndDate
                  ? `Current period ends ${new Date(`${subscription.subscriptionEndDate}T00:00:00`).toLocaleDateString()}`
                  : 'Your workspace is on the free plan.'}
              </p>
            </div>
            <BadgeCheck className="plan-check" size={22} />
          </section>
          <div className="section-intro"><div><p className="eyebrow">Choose a plan</p><h2>Upgrade your workspace</h2></div><span className="billing-secure"><Sparkles size={15} /> Secure payments by Razorpay</span></div>
          <div className="plan-grid">
            {plans.map((plan) => (
              <article className={`plan-card ${subscription?.planType === plan.type ? 'current' : ''}`} key={plan.type}>
                {subscription?.planType === plan.type && <span className="current-plan-label">Your current plan</span>}
                <h3>{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-price">{plan.price}<span>/{plan.type === 'MONTHLY' ? 'mo' : 'yr'}</span></div>
                <p className="plan-cadence">{plan.cadence}</p>
                <ul>
                  <li><BadgeCheck size={15} /> Team project workspace</li>
                  <li><BadgeCheck size={15} /> Tasks, comments, and chat</li>
                  <li><BadgeCheck size={15} /> Secure checkout</li>
                </ul>
                <button
                  className={subscription?.planType === plan.type ? 'secondary-button full-width' : 'primary-button full-width'}
                  disabled={Boolean(submitting) || subscription?.planType === plan.type}
                  onClick={() => purchasePlan(plan.type)}
                  type="button"
                >
                  {submitting === plan.type && <LoaderCircle className="spin" size={15} />}
                  {submitting === plan.type ? 'Opening checkout…' : subscription?.planType === plan.type ? 'Current plan' : `Choose ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
          <p className="billing-footnote">Plan changes take effect after the payment provider confirms your payment. The annual plan includes the backend's 30% annual discount.</p>
        </>
      )}
    </main>
  )
}
