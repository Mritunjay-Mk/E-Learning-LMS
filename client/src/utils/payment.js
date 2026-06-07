import { api } from '../api/client';

export const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
    document.body.appendChild(script);
  });

export const startPayment = async ({ type, courseId, navigate }) => {
  const data = await api.post('/payments/create-order', { type, courseId });

  if (data.free) {
    navigate('/payment-success?free=true');
    return data;
  }

  if (data.order.provider === 'mock') {
    await api.post('/payments/verify', {
      orderId: data.order.id,
      paymentId: `pay_mock_${Date.now()}`,
      signature: 'mock_signature'
    });
    navigate(`/payment-success?order=${data.order.id}`);
    return data;
  }

  await loadRazorpay();

  const options = {
    key: data.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: data.order.amount,
    currency: data.order.currency,
    name: 'LearnHub AI LMS',
    description: type === 'library' ? 'Library access pass' : 'Course enrollment',
    order_id: data.order.id,
    prefill: data.user,
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true
    },
    theme: {
      color: '#435ee8'
    },
    handler: async (response) => {
      await api.post('/payments/verify', {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature
      });
      navigate(`/payment-success?order=${response.razorpay_order_id}`);
    },
    modal: {
      ondismiss: () => navigate('/payment-failed?reason=cancelled')
    }
  };

  const checkout = new window.Razorpay(options);
  checkout.on('payment.failed', () => navigate('/payment-failed?reason=failed'));
  checkout.open();
  return data;
};
