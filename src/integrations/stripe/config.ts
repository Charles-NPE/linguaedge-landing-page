
// Environment variables for Stripe
export const getStripeConfig = () => {
  return {
    starterPriceId: import.meta.env.VITE_STARTER_PRICE_ID || '',
    academyPriceId: import.meta.env.VITE_ACADEMY_PRICE_ID || '',
    // Add other price IDs as needed
  };
};
