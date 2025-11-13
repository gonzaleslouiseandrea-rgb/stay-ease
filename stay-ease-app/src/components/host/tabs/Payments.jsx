import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function Payments({ amount }) {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h3>Complete Your Booking</h3>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount, // e.g. total booking price
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          const order = await actions.order.capture();
          alert("✅ Payment successful!");
          console.log(order);
        }}
        onError={(err) => {
          console.error("❌ Payment error:", err);
          alert("Something went wrong with the payment.");
        }}
      />
    </div>
  );
}
