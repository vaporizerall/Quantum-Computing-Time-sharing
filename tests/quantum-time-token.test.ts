import { describe, it, expect, beforeEach } from 'vitest';

// Mock contract state
let quantumTimeTokens = new Map();
let listings = new Map();
let jobs = new Map();
let verifications = new Map();

// Mock contract functions
const mintQuantumTimeTokens = (amount, recipient) => {
  const currentBalance = quantumTimeTokens.get(recipient) || 0;
  quantumTimeTokens.set(recipient, currentBalance + amount);
  return { type: 'ok', value: true };
};

const createListing = (seller, price, quantity) => {
  const listingId = listings.size;
  listings.set(listingId, { seller, price, quantity });
  return { type: 'ok', value: listingId };
};

const buyQuantumTime = (buyer, listingId, quantity) => {
  const listing = listings.get(listingId);
  if (!listing || listing.quantity < quantity) {
    return { type: 'err', value: 103 };
  }
  const totalPrice = listing.price * quantity;
  const buyerBalance = quantumTimeTokens.get(buyer) || 0;
  if (buyerBalance < totalPrice) {
    return { type: 'err', value: 101 };
  }
  quantumTimeTokens.set(buyer, buyerBalance - totalPrice);
  quantumTimeTokens.set(listing.seller, (quantumTimeTokens.get(listing.seller) || 0) + totalPrice);
  listing.quantity -= quantity;
  if (listing.quantity === 0) {
    listings.delete(listingId);
  }
  return { type: 'ok', value: true };
};

const submitJob = (owner, quantumTimeUnits) => {
  const jobId = jobs.size;
  jobs.set(jobId, { owner, status: 'queued', quantumTimeUnits, resultHash: null });
  return { type: 'ok', value: jobId };
};

const updateJobStatus = (jobId, newStatus) => {
  const job = jobs.get(jobId);
  if (!job) {
    return { type: 'err', value: 101 };
  }
  job.status = newStatus;
  return { type: 'ok', value: true };
};

const setJobResult = (jobId, resultHash) => {
  const job = jobs.get(jobId);
  if (!job) {
    return { type: 'err', value: 101 };
  }
  job.status = 'completed';
  job.resultHash = resultHash;
  return { type: 'ok', value: true };
};

const submitVerification = (jobId, verifier, isValid) => {
  const verificationId = verifications.size;
  verifications.set(verificationId, { jobId, verifier, isValid });
  return { type: 'ok', value: verificationId };
};

describe('Quantum Computing Time-sharing Platform', () => {
  beforeEach(() => {
    quantumTimeTokens.clear();
    listings.clear();
    jobs.clear();
    verifications.clear();
  });
  
  it('should allow job submission and execution', () => {
    mintQuantumTimeTokens(100, 'user1');
    const jobResult = submitJob('user1', 50);
    expect(jobResult.type).toBe('ok');
    expect(jobs.size).toBe(1);
    
    const updateResult = updateJobStatus(0, 'running');
    expect(updateResult.type).toBe('ok');
    expect(jobs.get(0).status).toBe('running');
    
    const completionResult = setJobResult(0, 'result_hash');
    expect(completionResult.type).toBe('ok');
    expect(jobs.get(0).status).toBe('completed');
    expect(jobs.get(0).resultHash).toBe('result_hash');
  });
  
  it('should allow result verification', () => {
    submitJob('user1', 50);
    setJobResult(0, 'result_hash');
    
    const verificationResult = submitVerification(0, 'verifier1', true);
    expect(verificationResult.type).toBe('ok');
    expect(verifications.size).toBe(1);
  });
});

