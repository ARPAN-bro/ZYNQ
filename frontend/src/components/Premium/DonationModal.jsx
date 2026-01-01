// frontend/src/components/Premium/DonationModal.jsx
import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { donationAPI } from '../../services/api';
import { DONATION_TIERS } from '../../utils/constants';

export default function DonationModal({ onClose }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount < 1) {
      alert('Please select or enter a valid amount');
      return;
    }

    setProcessing(true);

    try {
      const response = await donationAPI.create({ amount });
      
      // In a real app, you would redirect to Cashfree payment page
      // For now, we'll simulate success
      const { paymentSessionId, orderId } = response.data;
      
      // Simulate Cashfree payment redirect
      alert(`Payment session created!\nOrder ID: ${orderId}\n\nIn production, you would be redirected to Cashfree payment page.`);
      
      // After payment completion (simulated here), verify
      setTimeout(async () => {
        try {
          await donationAPI.verify({ orderId });
          alert('Thank you for your support! 💚');
          onClose();
          window.location.reload();
        } catch (error) {
          console.error('Verification error:', error);
        }
      }, 2000);

    } catch (error) {
      alert('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={24} />
        </button>

        <div style={styles.header}>
          <Heart size={48} color="#1DB954" fill="#1DB954" />
          <h2 style={styles.title}>Support Our Platform</h2>
          <p style={styles.subtitle}>
            Your donation helps us keep the music playing for everyone
          </p>
        </div>

        <div style={styles.tiers}>
          {DONATION_TIERS.map((tier) => (
            <button
              key={tier.amount}
              onClick={() => {
                setSelectedAmount(tier.amount);
                setCustomAmount('');
              }}
              style={{
                ...styles.tierBtn,
                ...(selectedAmount === tier.amount ? styles.tierBtnActive : {})
              }}
            >
              <div style={styles.tierAmount}>₹{tier.amount}</div>
              <div style={styles.tierLabel}>{tier.label}</div>
              <div style={styles.tierDescription}>{tier.description}</div>
            </button>
          ))}
        </div>

        <div style={styles.customSection}>
          <label style={styles.label}>Or enter custom amount</label>
          <div style={styles.inputContainer}>
            <span style={styles.currency}>₹</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="Enter amount"
              style={styles.input}
              min="1"
            />
          </div>
        </div>

        <button
          onClick={handleDonate}
          disabled={processing || (!selectedAmount && !customAmount)}
          style={{
            ...styles.donateBtn,
            ...(processing || (!selectedAmount && !customAmount) ? styles.donateBtnDisabled : {})
          }}
        >
          {processing ? 'Processing...' : `Donate ₹${selectedAmount || customAmount || '0'}`}
        </button>

        <p style={styles.note}>
          💚 All donations are voluntary. Premium features are donation-based.
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#181818',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: '#282828',
    color: '#FFFFFF'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '16px 0 8px'
  },
  subtitle: {
    color: '#B3B3B3',
    fontSize: '14px'
  },
  tiers: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  },
  tierBtn: {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#282828',
    border: '2px solid transparent',
    textAlign: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  tierBtnActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
    transform: 'scale(1.05)'
  },
  tierAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  tierLabel: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  tierDescription: {
    fontSize: '12px',
    color: '#B3B3B3'
  },
  customSection: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: '8px',
    padding: '4px 16px'
  },
  currency: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '8px',
    color: '#B3B3B3'
  },
  input: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: '16px'
  },
  donateBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '24px',
    backgroundColor: '#1DB954',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    transition: 'transform 0.2s'
  },
  donateBtnDisabled: {
    backgroundColor: '#282828',
    cursor: 'not-allowed',
    opacity: 0.5
  },
  note: {
    fontSize: '12px',
    color: '#B3B3B3',
    textAlign: 'center'
  }
};