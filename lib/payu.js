'use strict';

const crypto = require('node:crypto');

const PAYU_KEY = process.env.PAYU_KEY || '';
const PAYU_SALT = process.env.PAYU_SALT || '';
const PAYU_MODE = process.env.PAYU_MODE === 'live' ? 'live' : 'test';
const APP_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');

function isConfigured() {
  return Boolean(PAYU_KEY && PAYU_SALT);
}

function amount2(value) {
  return (Math.round((Number(value) || 0) * 100) / 100).toFixed(2);
}

function sha512(value) {
  return crypto.createHash('sha512').update(value).digest('hex');
}

function buildRequestHash({ txnid, amount, productinfo, firstname, email, udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '' }) {
  const hashString = [
    PAYU_KEY,
    txnid,
    amount2(amount),
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    '',
    '',
    '',
    '',
    '',
    PAYU_SALT,
  ].join('|');
  return sha512(hashString);
}

function verifyResponseHash(data) {
  if (!data || !data.hash) return false;
  const reverse = [
    PAYU_SALT,
    data.status,
    '',
    '',
    '',
    '',
    '',
    data.udf5 || '',
    data.udf4 || '',
    data.udf3 || '',
    data.udf2 || '',
    data.udf1 || '',
    data.email,
    data.firstname,
    data.productinfo,
    amount2(data.amount),
    data.txnid,
    PAYU_KEY,
  ].join('|');
  const expected = sha512(reverse);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(data.hash).toLowerCase()));
  } catch {
    return false;
  }
}

function actionUrl() {
  return PAYU_MODE === 'live'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';
}

function buildRequest(order, items) {
  const firstname = String(order.customer_name || '').trim().split(/\s+/)[0] || 'Customer';
  const productinfo = items.length === 1 ? items[0].title : `${items[0].title} + ${items.length - 1} more`;
  const txnid = order.order_no;
  const amount = amount2(order.total);
  const email = order.email;
  const phone = order.phone;
  const udf1 = order.order_no;
  const udf2 = 'artguru';
  const hash = buildRequestHash({ txnid, amount, productinfo, firstname, email, udf1, udf2 });

  return {
    action: actionUrl(),
    fields: {
      key: PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: `${APP_URL}/payu/success`,
      furl: `${APP_URL}/payu/failure`,
      hash,
      udf1,
      udf2,
      udf3: '',
      udf4: '',
      udf5: '',
      address1: order.address,
      city: order.city,
      state: order.state,
      country: 'India',
      zipcode: order.pincode,
    },
  };
}

module.exports = {
  PAYU_KEY,
  PAYU_SALT,
  PAYU_MODE,
  APP_URL,
  isConfigured,
  amount2,
  buildRequest,
  verifyResponseHash,
  actionUrl,
};
