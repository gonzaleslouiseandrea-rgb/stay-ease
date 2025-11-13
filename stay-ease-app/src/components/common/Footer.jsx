import React from "react";
import { Box, Container, Grid, Typography, Link, Stack, Divider } from "@mui/material";

const footerLinks = {
  StayEase: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Press", href: "#press" },
  ],
  Explore: [
    { label: "Homes", href: "#homes" },
    { label: "Experiences", href: "#experiences" },
    { label: "Services", href: "#services" },
  ],
  Support: [
    { label: "Help Center", href: "#help" },
    { label: "Safety", href: "#safety" },
    { label: "Contact", href: "#contact" },
  ],
};

const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: "#f0eee7", color: "#5b584f", mt: 6 }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={700} color="#5f7d45">
              StayEase
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Slow living stays and curated experiences designed to help you recharge, reconnect, and feel at home
              wherever you go.
            </Typography>
          </Grid>

          {Object.entries(footerLinks).map(([section, links]) => (
            <Grid item xs={12} sm={4} md={2} key={section}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {section}
              </Typography>
              <Stack spacing={1}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    underline="none"
                    color="text.secondary"
                    sx={{
                      fontSize: 14,
                      "&:hover": { color: "#87ab69" },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} StayEase. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3} mt={{ xs: 2, sm: 0 }}>
            <Link href="#terms" underline="none" color="text.secondary" sx={{ "&:hover": { color: "#87ab69" } }}>
              Terms
            </Link>
            <Link href="#privacy" underline="none" color="text.secondary" sx={{ "&:hover": { color: "#87ab69" } }}>
              Privacy
            </Link>
            <Link href="#accessibility" underline="none" color="text.secondary" sx={{ "&:hover": { color: "#87ab69" } }}>
              Accessibility
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
