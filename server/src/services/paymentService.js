import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const hasRazorpay = Boolean(env.razorpayKeyId && env.razorpayKeySecret);

const client = () => {
  if (!hasRazorpay) {
    if (env.isProduction) throw new ApiError(500, 'Razorpay keys are not configured.');
    return null;
  }

  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret
  });
};

export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  const razorpay = client();

  if (!razorpay) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: amount * 100,
      currency,
      receipt,
      notes,
      provider: 'mock'
    };
  }

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt,
    notes,
    payment_capture: 1
  });

  return { ...order, provider: 'razorpay' };
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!hasRazorpay) {
    return signature === 'mock_signature' || orderId?.startsWith('order_mock_');
  }

  const digest = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return digest === signature;
};
