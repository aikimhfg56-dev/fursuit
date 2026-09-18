const PAYMENT_METHODS = [
  { label: "Visa", src: "/payment-logos/visa.png" },
  { label: "Mastercard", src: "/payment-logos/mastercard.svg" },
  { label: "American Express", src: "/payment-logos/amex.png" },
  { label: "Discover", src: "/payment-logos/discover.jpg" },
  { label: "JCB", src: "/payment-logos/jcb.svg" },
  { label: "PayPal", src: "/payment-logos/paypal.png" },
  { label: "Alipay", src: "/payment-logos/alipay.png" },
  { label: "Apple Pay", src: "/payment-logos/apple-pay.svg" },
] as const;

export default function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {PAYMENT_METHODS.map((method) => (
        <span
          key={method.label}
          className="flex h-9 w-16 items-center justify-center rounded-md border border-black/10 bg-white p-1.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size logo marks, no need for next/image here */}
          <img src={method.src} alt={method.label} className="max-h-full max-w-full object-contain" />
        </span>
      ))}
    </div>
  );
}
