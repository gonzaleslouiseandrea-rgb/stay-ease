import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_CLIENT_ID } from "../../firebaseConfig";

export default function Checkout({ amount }) {
  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          })
        }
        onApprove={(data, actions) =>
          actions.order.capture().then((details) => {
            alert(`Transaction completed by ${details.payer.name.given_name}`);
          })
        }
      />
    </PayPalScriptProvider>
  );
}
