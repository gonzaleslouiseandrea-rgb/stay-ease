import React, { useEffect, useMemo, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Box, Card, CardContent, CardActions, Typography, Button, Grid, Alert } from "@mui/material";
import { db, auth, PAYPAL_CLIENT_ID } from "../../../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";

const PLANS = [
  { id: "basic_monthly", name: "Basic", price: 299, currency: "PHP", interval: "monthly", quota: 3 },
  { id: "pro_monthly", name: "Pro", price: 599, currency: "PHP", interval: "monthly", quota: 8 },
  { id: "annual", name: "Annual", price: 1299, currency: "PHP", interval: "yearly", quota: null }, // null = unlimited
];

function getPeriodEnd(start, interval) {
  const d = new Date(start);
  if (interval === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

export default function Subscription() {
  const [sub, setSub] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const un = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (!u) return;
      const ref = doc(db, "subscriptions", u.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setSub({ id: ref.id, ...snap.data() });
    });
    return () => un();
  }, []);

  const paypalOptions = useMemo(() => ({ "client-id": PAYPAL_CLIENT_ID, currency: "PHP" }), []);

  const handleActivate = async (plan) => {
    setError("");
    if (!user) {
      setError("You must be logged in.");
      return;
    }
  };

  const onApproved = async (plan, order) => {
    if (!user) return;
    const now = new Date();
    const periodEnd = getPeriodEnd(now, plan.interval);
    const ref = doc(db, "subscriptions", user.uid);
    await setDoc(ref, {
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      quota: plan.quota, // null => unlimited
      used: 0,
      periodStart: Timestamp.fromDate(now),
      periodEnd: Timestamp.fromDate(periodEnd),
      active: true,
      lastPayment: {
        provider: "paypal",
        orderID: order?.id || null,
        at: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    const snap = await getDoc(ref);
    setSub({ id: ref.id, ...snap.data() });
  };

  const PlanCard = ({ plan }) => (
    <Card sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
      <CardContent>
        <Typography variant="h6" color="#5f7d45" fontWeight="bold">{plan.name}</Typography>
        <Typography variant="h4" sx={{ my: 1 }}>
          ₱{plan.price}
          <Typography component="span" variant="body1" color="text.secondary">/{plan.interval === "monthly" ? "mo" : "yr"}</Typography>
        </Typography>
        <Typography color="text.secondary">
          {plan.quota ? `${plan.quota} listings per month` : "Unlimited listings"}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            style={{ layout: "horizontal" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: { value: plan.price.toString() },
                    description: `StayEase Host Subscription - ${plan.name} (${plan.interval})`,
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              const order = await actions.order.capture();
              await onApproved(plan, order);
            }}
            onError={(err) => setError(`Payment error: ${err?.message || "Unknown"}`)}
          />
        </PayPalScriptProvider>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" mb={2} color="#5f7d45">Host Subscription</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {sub?.active && (
        <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Typography variant="subtitle1">Current Plan: <strong>{sub.planName}</strong> ({sub.interval})</Typography>
          <Typography variant="body2" color="text.secondary">
            {sub.quota ? `Usage: ${sub.used}/${sub.quota} (resets ${sub.periodEnd?.toDate?.().toLocaleDateString?.() || ""})` : "Unlimited listings"}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {PLANS.map((p) => (
          <Grid key={p.id} item xs={12} md={4}>
            <PlanCard plan={p} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
