import React, { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Paper,
    Grid,
    Divider,
    Link,
    Alert,
    InputAdornment,
} from "@mui/material";

import {
    ArrowBack,
    CheckCircle,
    Lock,
    Block,
    Sms,
    Help,
    ArrowForward,
    Phone,
} from "@mui/icons-material";
import axios from "axios";
import Api from "../Api";

const saffron = "#E8711A";
const saffronLight = "#FDF3EB";
const green = "#0A5C33";
const greenLight = "#EBF7F1";
const navy = "#0E1423";
const cream = "#FAF7F2";
const warmWhite = "#FFFDF9";
const textSecondary = "#4A5568";
const textMuted = "#8A9BB0";
const border = "#E8E2D8";

const SmsNotifications = () => {
    const [countryCode, setCountryCode] = useState("+1");
    const [phone, setPhone] = useState("");
    const [consent, setConsent] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const isSmsApproved = user?.isMessageApproved === true;

    const isValid = consent && phone.trim().length >= 10;

    const handleSubmit = async () => {
        if (!isValid) return;

        try {
            const res = await axios.patch(
                `${Api}/notification/optin/${user.id}`,
                {
                    isMessageApproved: true,
                    messageNumber: `${countryCode}${phone}`,
                }
            );

            console.log("Opt-in updated:", res.data);

            // Update localStorage
            const updatedUser = {
                ...user,
                isMessageApproved: true,
                messageNumber: `${countryCode}${phone}`,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            setSubmitted(true);
        } catch (error) {
            console.error("Opt-in update failed:", error);

            console.error(
                error?.response?.data?.message ||
                "Failed to subscribe"
            );
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: cream,
                color: navy,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* ================= NAVBAR ================= */}

            <Box
                component="nav"
                sx={{
                    backgroundColor: warmWhite,
                    borderBottom: `1px solid ${border}`,
                    px: { xs: 2, sm: 4 },
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo */}

                <Typography
                    sx={{
                        fontFamily: "Georgia, serif",
                        fontSize: { xs: 22, sm: 25 },
                        fontWeight: 900,
                        color: saffron,
                        letterSpacing: "-0.5px",
                    }}
                >
                    Saa
                    <Box
                        component="span"
                        sx={{
                            color: green,
                        }}
                    >
                        thi
                    </Box>{" "}
                    Rides
                </Typography>

                {/* Back */}

                <Link
                    href="https://saathirides.net"
                    underline="none"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: textSecondary,
                        fontSize: 14,
                        "&:hover": {
                            color: saffron,
                        },
                    }}
                >
                    <ArrowBack sx={{ fontSize: 17 }} />

                    Back to app
                </Link>
            </Box>

            {/* ================= HERO ================= */}

            <Box
                sx={{
                    background: `linear-gradient(135deg, ${navy} 0%, #1C2640 100%)`,
                    px: 2,
                    py: { xs: 6, md: 8 },
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",

                    "&::before": {
                        content: '"🙏"',
                        position: "absolute",
                        right: -20,
                        top: -25,
                        fontSize: { xs: 90, md: 120 },
                        opacity: 0.06,
                        transform: "rotate(15deg)",
                    },
                }}
            >
                {/* Eyebrow */}

                <Box
                    sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        backgroundColor: "rgba(232,113,26,0.15)",
                        border: "1px solid rgba(232,113,26,0.3)",
                        borderRadius: 10,
                        px: 2,
                        py: 0.7,
                        mb: 2.5,
                    }}
                >
                    <Sms
                        sx={{
                            fontSize: 16,
                            color: "#F5A04A",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#F5A04A",
                            letterSpacing: "0.5px",
                        }}
                    >
                        SMS Notifications
                    </Typography>
                </Box>

                {/* Heading */}

                <Typography
                    component="h1"
                    sx={{
                        fontFamily: "Georgia, serif",
                        fontSize: {
                            xs: 30,
                            sm: 38,
                            md: 46,
                        },
                        fontWeight: 900,
                        color: "#fff",
                        lineHeight: 1.1,
                        letterSpacing: "-1px",
                        maxWidth: 600,
                        mx: "auto",
                        mb: 2,
                    }}
                >
                    Stay connected to your{" "}
                    <Box
                        component="span"
                        sx={{
                            color: "#F5A04A",
                            fontStyle: "italic",
                        }}
                    >
                        community
                    </Box>
                </Typography>

                <Typography
                    sx={{
                        fontSize: 16,
                        color: "rgba(255,255,255,0.55)",
                        maxWidth: 480,
                        mx: "auto",
                        lineHeight: 1.7,
                    }}
                >
                    Get instant SMS alerts for ride matches, confirmations, and
                    community updates — no app download needed.
                </Typography>
            </Box>

            {/* ================= MAIN ================= */}

            <Container
                maxWidth="sm"
                sx={{
                    py: { xs: 5, md: 6 },
                    flex: 1,
                }}
            >
                {/* ================= SMS EXAMPLES ================= */}

                <Typography
                    sx={{
                        fontFamily: "Georgia, serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: navy,
                        mb: 2.5,
                    }}
                >
                    Messages you'll receive
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mb: 5,
                    }}
                >
                    <SmsMessage
                        text={
                            <>
                                🙏 Welcome to Saathi, Priya! You've joined the community
                                through Meena R.'s invite. Your profile is live:{" "}
                                <Link href="#" sx={{ color: saffron }}>
                                    saathirides.net/join
                                </Link>
                            </>
                        }
                        label="Welcome message"
                    />

                    <SmsMessage
                        text={
                            <>
                                ✅ Ride confirmed! Rahul S. will pick you up from Plano at
                                6:00 AM on Dec 18 for DFW Airport. Reply HELP for support or
                                STOP to cancel.
                            </>
                        }
                        label="Ride confirmation"
                    />

                    <SmsMessage
                        text={
                            <>
                                🚗 New match near you! Ananya K. is offering a ride from
                                Chicago to Dallas on Dec 20 — 3 seats available. View:{" "}
                                <Link href="#" sx={{ color: saffron }}>
                                    saathirides.net/rides
                                </Link>
                            </>
                        }
                        label="Ride match alert"
                    />

                    <SmsMessage
                        text={
                            <>
                                🔔 Neel K. has requested your ride to DFW on Dec 18. Accept or
                                decline:{" "}
                                <Link href="#" sx={{ color: saffron }}>
                                    saathirides.net/requests
                                </Link>{" "}
                                — Reply STOP to unsubscribe.
                            </>
                        }
                        label="Ride request"
                    />
                </Box>

                {/* ================= OPT-IN CARD ================= */}

                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: warmWhite,
                        border: `1.5px solid ${border}`,
                        borderRadius: 3,
                        p: { xs: 2.5, sm: 4 },
                        mb: 4,
                    }}
                >
                    {/* =====================================================
        ALREADY SUBSCRIBED
    ====================================================== */}

                    {user?.isMessageApproved === true ? (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 4,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    backgroundColor: greenLight,
                                    border: `2px solid ${green}`,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 2,
                                }}
                            >
                                <CheckCircle
                                    sx={{
                                        fontSize: 32,
                                        color: green,
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: 22,
                                    fontWeight: 700,
                                    mb: 1,
                                    color: navy,
                                }}
                            >
                                SMS notifications are already enabled 🙏
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 14,
                                    color: textSecondary,
                                    lineHeight: 1.7,
                                    maxWidth: 450,
                                    mx: "auto",
                                }}
                            >
                                You're already subscribed to Saathi Rides SMS notifications.
                                <br />
                                We'll send you ride confirmations, match alerts, and important
                                community updates.
                            </Typography>

                            <Box
                                sx={{
                                    mt: 2.5,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 1,
                                    backgroundColor: greenLight,
                                    color: green,
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    fontSize: 13,
                                    fontWeight: 600,
                                }}
                            >
                                <Sms sx={{ fontSize: 18 }} />
                                SMS alerts enabled
                            </Box>

                            <Typography
                                sx={{
                                    mt: 2,
                                    fontSize: 12,
                                    color: textMuted,
                                }}
                            >
                                Reply STOP to any message if you want to unsubscribe.
                            </Typography>

                            <Button
                                href="https://saathirides.net/find-ride"
                                startIcon={<ArrowBack />}
                                sx={{
                                    mt: 3,
                                    color: saffron,
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                Back to Saathi Rides
                            </Button>
                        </Box>
                    ) : !submitted ? (
                        /* =====================================================
                           OPT-IN FORM
                        ====================================================== */

                        <>
                            <Typography
                                sx={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: 20,
                                    fontWeight: 700,
                                    mb: 0.7,
                                }}
                            >
                                Sign up for SMS notifications
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 14,
                                    color: textSecondary,
                                    mb: 3,
                                    lineHeight: 1.6,
                                }}
                            >
                                Enter your number below to receive ride alerts and community
                                updates from Saathi Rides. Standard message rates apply.
                            </Typography>

                            {/* Phone */}

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: textMuted,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.7px",
                                    mb: 1,
                                }}
                            >
                                Your mobile number
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                <Select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    size="small"
                                    sx={{
                                        minWidth: 100,
                                        backgroundColor: cream,
                                        borderRadius: 1.5,

                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: border,
                                        },

                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: saffron,
                                        },

                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: saffron,
                                        },
                                    }}
                                >
                                    <MenuItem value="+1">🇺🇸 +1</MenuItem>
                                    <MenuItem value="+91">🇮🇳 +91</MenuItem>
                                </Select>

                                <TextField
                                    fullWidth
                                    size="small"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={
                                        countryCode === "+1"
                                            ? "(972) 555-0142"
                                            : "9876543210"
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone
                                                    sx={{
                                                        fontSize: 18,
                                                        color: textMuted,
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: cream,
                                            borderRadius: 1.5,

                                            "& fieldset": {
                                                borderColor: border,
                                            },

                                            "&:hover fieldset": {
                                                borderColor: saffron,
                                            },

                                            "&.Mui-focused fieldset": {
                                                borderColor: saffron,
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Consent */}

                            <Box
                                sx={{
                                    backgroundColor: saffronLight,
                                    border: "1px solid rgba(232,113,26,0.2)",
                                    borderRadius: 1.5,
                                    p: 2,
                                    mb: 2.5,
                                }}
                            >
                                <FormControlLabel
                                    sx={{
                                        alignItems: "flex-start",
                                        m: 0,
                                    }}
                                    control={
                                        <Checkbox
                                            checked={consent}
                                            onChange={(e) =>
                                                setConsent(e.target.checked)
                                            }
                                            sx={{
                                                color: saffron,
                                                p: 0.3,
                                                mr: 1,
                                                mt: 0.2,

                                                "&.Mui-checked": {
                                                    color: saffron,
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            sx={{
                                                fontSize: 13,
                                                color: textSecondary,
                                                lineHeight: 1.7,
                                            }}
                                        >
                                            By checking this box and clicking the button below,
                                            I provide my express written consent to receive
                                            recurring automated SMS text messages from{" "}
                                            <strong>Saathi Rides</strong> at the mobile number
                                            provided above. Messages may include ride
                                            confirmations, match alerts, community updates,
                                            and service notifications. Message frequency
                                            varies. Message & data rates may apply. Consent is
                                            not a condition of joining Saathi. Reply{" "}
                                            <strong>STOP</strong> to unsubscribe at any time.
                                            Reply <strong>HELP</strong> for help. View our{" "}
                                            <Link
                                                href="/privacy"
                                                sx={{ color: saffron }}
                                            >
                                                Privacy Policy
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                href="/terms"
                                                sx={{ color: saffron }}
                                            >
                                                Terms of Service
                                            </Link>
                                            .
                                        </Typography>
                                    }
                                />
                            </Box>

                            {/* Submit */}

                            <Button
                                fullWidth
                                disabled={!isValid}
                                onClick={handleSubmit}
                                variant="contained"
                                endIcon={<ArrowForward />}
                                sx={{
                                    py: 1.5,
                                    backgroundColor: saffron,
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    fontSize: 15,
                                    fontWeight: 700,

                                    "&:hover": {
                                        backgroundColor: "#C95E0E",
                                    },

                                    "&.Mui-disabled": {
                                        backgroundColor: border,
                                        color: "#999",
                                    },
                                }}
                            >
                                Yes, send me SMS notifications
                            </Button>

                            {/* Fine print */}

                            <Typography
                                sx={{
                                    mt: 1.5,
                                    fontSize: 12,
                                    color: textMuted,
                                    textAlign: "center",
                                    lineHeight: 1.6,
                                }}
                            >
                                By subscribing you agree to our{" "}
                                <Link
                                    href="/terms"
                                    sx={{ color: saffron }}
                                >
                                    Terms
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    sx={{ color: saffron }}
                                >
                                    Privacy Policy
                                </Link>
                                .
                                <br />
                                Msg & data rates may apply. Text STOP to cancel anytime. Text
                                HELP for help.
                                <br />
                                Supported carriers: AT&T, Verizon, T-Mobile, Sprint, and most
                                US carriers.
                            </Typography>
                        </>
                    ) : (
                        /* =====================================================
                           SUCCESS AFTER SUBMIT
                        ====================================================== */

                        <Box
                            sx={{
                                textAlign: "center",
                                py: 4,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    backgroundColor: greenLight,
                                    border: `2px solid ${green}`,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mx: "auto",
                                    mb: 2,
                                }}
                            >
                                <CheckCircle
                                    sx={{
                                        fontSize: 30,
                                        color: green,
                                    }}
                                />
                            </Box>

                            <Typography
                                sx={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: 22,
                                    fontWeight: 700,
                                    mb: 1,
                                }}
                            >
                                You're subscribed 🙏
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 14,
                                    color: textSecondary,
                                    lineHeight: 1.7,
                                }}
                            >
                                You'll receive a confirmation text shortly.
                                <br />
                                Reply STOP at any time to unsubscribe.
                            </Typography>

                            <Button
                                href="https://saathirides.net/find-ride"
                                startIcon={<ArrowBack />}
                                sx={{
                                    mt: 3,
                                    color: saffron,
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                Back to Saathi Rides
                            </Button>
                        </Box>
                    )}
                </Paper>

                {/* ================= HOW IT WORKS ================= */}

                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: warmWhite,
                        border: `1px solid ${border}`,
                        borderRadius: 2,
                        p: { xs: 2.5, sm: 3.5 },
                        mb: 3,
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: "Georgia, serif",
                            fontSize: 18,
                            fontWeight: 700,
                            mb: 2.5,
                        }}
                    >
                        How our SMS works
                    </Typography>

                    <Grid container spacing={2.5}>
                        <ComplianceItem
                            icon={<Lock />}
                            title="Your number stays private"
                            text="We never share or sell your phone number to anyone, ever."
                        />

                        <ComplianceItem
                            icon={<Block />}
                            title="Cancel anytime"
                            text="Reply STOP to any message and you're immediately unsubscribed."
                        />

                        <ComplianceItem
                            icon={<Sms />}
                            title="Only relevant messages"
                            text="We only send messages about your rides, requests, and community activity."
                        />

                        <ComplianceItem
                            icon={<Help />}
                            title="Need help?"
                            text="Reply HELP to any message or email us at support@saathirides.net"
                        />
                    </Grid>
                </Paper>

                {/* ================= LEGAL ================= */}

                <Box
                    sx={{
                        borderTop: `1px solid ${border}`,
                        pt: 3,
                        fontSize: 12,
                        color: textMuted,
                        lineHeight: 1.8,
                    }}
                >
                    <LegalText
                        title="Program name:"
                        text="Saathi Rides SMS Notifications"
                    />

                    <LegalText
                        title="Program description:"
                        text="Saathi Rides sends SMS text messages to users who have opted in to receive ride confirmations, match alerts, community event notifications, and service updates related to their use of the Saathi Rides community ridesharing platform at saathirides.net."
                    />

                    <LegalText
                        title="Message frequency:"
                        text="Message frequency varies based on your activity on the platform. You may receive between 1–10 messages per week depending on your ride activity and community engagement."
                    />

                    <LegalText
                        title="Message & data rates:"
                        text="Standard message and data rates may apply depending on your carrier and plan. Saathi Rides does not charge for SMS messages; however, your carrier may charge for receiving texts."
                    />

                    <LegalText
                        title="To stop receiving messages:"
                        text="Reply STOP to any Saathi Rides text message at any time. You will receive one final confirmation message and then no further messages will be sent."
                    />

                    <LegalText
                        title="For help:"
                        text="Reply HELP to any message or contact us at support@saathirides.net"
                    />

                    <LegalText
                        title="Supported carriers:"
                        text="AT&T, Verizon Wireless, T-Mobile, Sprint, Boost Mobile, Cricket, MetroPCS, U.S. Cellular, and most major US carriers. Carrier is not liable for delayed or undelivered messages."
                    />

                    <Typography sx={{ fontSize: 12 }}>
                        For full details see our{" "}
                        <Link href="/privacy" sx={{ color: saffron }}>
                            Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link href="/terms" sx={{ color: saffron }}>
                            Terms of Service
                        </Link>
                        .
                    </Typography>
                </Box>
            </Container>

            {/* ================= FOOTER ================= */}

            <Box
                component="footer"
                sx={{
                    backgroundColor: navy,
                    px: 2,
                    py: 3,
                    textAlign: "center",
                }}
            >
                <Typography
                    sx={{
                        fontFamily: "Georgia, serif",
                        fontSize: 20,
                        fontWeight: 900,
                        color: saffron,
                        mb: 1,
                    }}
                >
                    Saa
                    <Box
                        component="span"
                        sx={{
                            color: "#fff",
                        }}
                    >
                        thi
                    </Box>{" "}
                    Rides
                </Typography>

                <Typography
                    sx={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        lineHeight: 1.7,
                    }}
                >
                    Community ridesharing built on trust · saathirides.net
                    <br />
                    © 2026 Saathi Rides. All rights reserved.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2.5,
                        mt: 1.5,
                    }}
                >
                    <Link
                        href="/privacy"
                        underline="none"
                        sx={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            "&:hover": {
                                color: saffron,
                            },
                        }}
                    >
                        Privacy Policy
                    </Link>

                    <Link
                        href="/terms"
                        underline="none"
                        sx={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            "&:hover": {
                                color: saffron,
                            },
                        }}
                    >
                        Terms of Service
                    </Link>

                    <Link
                        href="mailto:support@saathirides.net"
                        underline="none"
                        sx={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.4)",
                            "&:hover": {
                                color: saffron,
                            },
                        }}
                    >
                        Support
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

/* =========================================================
   SMS MESSAGE COMPONENT
========================================================= */

const SmsMessage = ({ text, label }) => {
    return (
        <Box
            sx={{
                backgroundColor: warmWhite,
                border: `1px solid ${border}`,
                borderRadius: "16px 16px 16px 4px",
                p: 2,
                maxWidth: 480,
                position: "relative",

                "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    bottom: -8,
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: `8px solid ${warmWhite}`,
                },
            }}
        >
            <Typography
                sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: saffron,
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    mb: 0.7,
                }}
            >
                Saathi Rides
            </Typography>

            <Typography
                sx={{
                    fontSize: 14,
                    color: navy,
                    lineHeight: 1.6,
                }}
            >
                {text}
            </Typography>

            <Box
                sx={{
                    display: "inline-block",
                    mt: 1,
                    px: 1.2,
                    py: 0.3,
                    borderRadius: 2,
                    backgroundColor: saffronLight,
                    color: saffron,
                    fontSize: 11,
                    fontWeight: 600,
                }}
            >
                {label}
            </Box>
        </Box>
    );
};

/* =========================================================
   COMPLIANCE ITEM
========================================================= */

const ComplianceItem = ({ icon, title, text }) => {
    return (
        <Grid item xs={12} sm={6}>
            <Box
                sx={{
                    display: "flex",
                    gap: 1.2,
                    alignItems: "flex-start",
                }}
            >
                <Box
                    sx={{
                        color: green,
                        display: "flex",
                        mt: 0.2,
                    }}
                >
                    {React.cloneElement(icon, {
                        sx: {
                            fontSize: 20,
                        },
                    })}
                </Box>

                <Box>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            mb: 0.3,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 12,
                            color: textSecondary,
                            lineHeight: 1.6,
                        }}
                    >
                        {text}
                    </Typography>
                </Box>
            </Box>
        </Grid>
    );
};

/* =========================================================
   LEGAL TEXT
========================================================= */

const LegalText = ({ title, text }) => {
    return (
        <Typography
            component="p"
            sx={{
                fontSize: 12,
                color: textMuted,
                lineHeight: 1.8,
                mb: 1,
            }}
        >
            <Box
                component="strong"
                sx={{
                    color: textSecondary,
                }}
            >
                {title}
            </Box>{" "}
            {text}
        </Typography>
    );
};

export default SmsNotifications;