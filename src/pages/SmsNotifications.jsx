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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

    const isSmsApproved = user?.isMessageApproved === true;

    const cleanPhone = phone.replace(/\D/g, "");

    /*
     * Saathi Rides currently accepts US and India numbers.
     *
     * US:
     * +1 + 10 digit number
     *
     * India:
     * +91 + 10 digit number
     */
    const isValidPhone =
        cleanPhone.length === 10 &&
        (countryCode === "+1" || countryCode === "+91");

    /*
     * Consent must be explicitly checked.
     *
     * The phone number alone does NOT constitute consent.
     */
    const isValid = consent && isValidPhone;

    const handleSubmit = async () => {
        if (!isValid || loading) return;

        setError("");
        setLoading(true);

        const fullPhoneNumber = `${countryCode}${cleanPhone}`;

        try {
            const res = await axios.patch(
                `${Api}/notification/optin`,
                {
                    isMessageApproved: true,
                    messageNumber: fullPhoneNumber,
                }
            );

            console.log(
                "Saathi Rides SMS opt-in updated:",
                res.data
            );

            const updatedUser = {
                ...user,
                isMessageApproved: true,
                messageNumber: fullPhoneNumber,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setSubmitted(true);
        } catch (error) {
            console.error(
                "Saathi Rides SMS opt-in update failed:",
                error
            );

            setError(
                error?.response?.data?.message ||
                    "We couldn't complete your Saathi Rides SMS subscription. Please try again."
            );
        } finally {
            setLoading(false);
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
            {/* =========================================================
                NAVBAR
            ========================================================= */}

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
                {/* Saathi Rides branding */}

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

                <Link
                    href="https://saathirides.net/find-ride"
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
                    Back to Saathi Rides
                </Link>
            </Box>

            {/* =========================================================
                HERO
            ========================================================= */}

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
                        Saathi Rides SMS Notifications
                    </Typography>
                </Box>

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
                        maxWidth: 700,
                        mx: "auto",
                        mb: 2,
                    }}
                >
                    Stay connected with{" "}
                    <Box
                        component="span"
                        sx={{
                            color: "#F5A04A",
                            fontStyle: "italic",
                        }}
                    >
                        Saathi Rides
                    </Box>
                </Typography>

                <Typography
                    sx={{
                        fontSize: 16,
                        color: "rgba(255,255,255,0.65)",
                        maxWidth: 600,
                        mx: "auto",
                        lineHeight: 1.7,
                    }}
                >
                    Saathi Rides may send you SMS messages about your
                    Saathi Rides account, phone verification, rides,
                    bookings, ride requests, ride matches, and important
                    service notifications.
                </Typography>
            </Box>

            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}

            <Container
                maxWidth="sm"
                sx={{
                    py: { xs: 5, md: 6 },
                    flex: 1,
                }}
            >
                {/* =====================================================
                    DIRECT BUSINESS RELATIONSHIP
                ===================================================== */}

                <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: greenLight,
                        border: `1px solid rgba(10,92,51,0.15)`,
                        borderRadius: 2,
                        p: { xs: 2.5, sm: 3 },
                        mb: 4,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.5,
                            alignItems: "flex-start",
                        }}
                    >
                        <CheckCircle
                            sx={{
                                color: green,
                                fontSize: 23,
                                mt: 0.2,
                            }}
                        />

                        <Box>
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: navy,
                                    mb: 0.6,
                                }}
                            >
                                You are communicating directly with
                                Saathi Rides
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 13,
                                    color: textSecondary,
                                    lineHeight: 1.7,
                                }}
                            >
                                Saathi Rides is the business providing
                                your ridesharing account and related
                                services. If you choose SMS notifications,
                                you are giving your consent directly to
                                <strong> Saathi Rides</strong> to send
                                service-related text messages to the
                                mobile number you provide.
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* =====================================================
                    SMS EXAMPLES
                ===================================================== */}

                <Typography
                    sx={{
                        fontFamily: "Georgia, serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: navy,
                        mb: 2.5,
                    }}
                >
                    Examples of Saathi Rides SMS messages
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
                                Saathi Rides: Your verification code is
                                123456. Use this code to verify your
                                phone number. Reply HELP for help.
                            </>
                        }
                        label="Phone verification"
                    />

                    <SmsMessage
                        text={
                            <>
                                Saathi Rides: Your ride is confirmed.
                                Rahul will pick you up from Plano at
                                6:00 AM on Dec 18 for DFW Airport.
                                Reply STOP to unsubscribe.
                            </>
                        }
                        label="Ride confirmation"
                    />

                    <SmsMessage
                        text={
                            <>
                                Saathi Rides: New ride match! Ananya
                                is offering a ride from Chicago to
                                Dallas on Dec 20. View your ride at
                                saathirides.net/rides. Reply STOP to
                                unsubscribe.
                            </>
                        }
                        label="Ride match"
                    />

                    <SmsMessage
                        text={
                            <>
                                Saathi Rides: Neel has requested your
                                ride to DFW on Dec 18. Review the
                                request at saathirides.net/requests.
                                Reply STOP to unsubscribe.
                            </>
                        }
                        label="Ride request"
                    />

                    <SmsMessage
                        text={
                            <>
                                Saathi Rides: Your booking status has
                                been updated. Please open the Saathi
                                Rides app to view the latest details.
                                Reply STOP to unsubscribe.
                            </>
                        }
                        label="Account/service notification"
                    />
                </Box>

                {/* =====================================================
                    OPT-IN CARD
                ===================================================== */}

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
                    {/* =================================================
                        ALREADY SUBSCRIBED
                    ================================================= */}

                    {isSmsApproved ? (
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
                                Saathi Rides SMS notifications are enabled
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
                                You have voluntarily opted in to receive
                                service-related SMS messages directly from
                                Saathi Rides.

                                <br />

                                Messages may include phone verification
                                codes, ride confirmations, booking updates,
                                ride matches, ride requests, and important
                                service notifications related to your
                                Saathi Rides account and activity.
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
                                Saathi Rides SMS subscription active
                            </Box>

                            <Typography
                                sx={{
                                    mt: 2,
                                    fontSize: 12,
                                    color: textMuted,
                                }}
                            >
                                Reply STOP to any Saathi Rides SMS to
                                unsubscribe.
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
                        <>
                            {/* =========================================
                                OPT-IN FORM
                            ========================================= */}

                            <Typography
                                sx={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: 22,
                                    fontWeight: 700,
                                    mb: 0.7,
                                }}
                            >
                                Get SMS notifications from Saathi Rides
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 14,
                                    color: textSecondary,
                                    mb: 3,
                                    lineHeight: 1.7,
                                }}
                            >
                                You are an existing or prospective user of
                                Saathi Rides. If you would like Saathi Rides
                                to contact you by SMS about your account and
                                Saathi Rides service activity, enter your
                                mobile number and provide your consent below.

                                <br />

                                <strong>
                                    SMS consent is completely optional.
                                </strong>{" "}
                                You can use Saathi Rides without agreeing to
                                receive these SMS messages.
                            </Typography>

                            {/* =========================================
                                MOBILE NUMBER
                            ========================================= */}

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
                                Mobile number
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    mb: 2.5,
                                }}
                            >
                                <Select
                                    value={countryCode}
                                    onChange={(e) => {
                                        setCountryCode(e.target.value);
                                        setPhone("");
                                    }}
                                    size="small"
                                    sx={{
                                        minWidth: 100,
                                        backgroundColor: cream,
                                        borderRadius: 1.5,

                                        "& .MuiOutlinedInput-notchedOutline":
                                            {
                                                borderColor: border,
                                            },

                                        "&:hover .MuiOutlinedInput-notchedOutline":
                                            {
                                                borderColor: saffron,
                                            },

                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                            {
                                                borderColor: saffron,
                                            },
                                    }}
                                >
                                    <MenuItem value="+1">
                                        🇺🇸 +1
                                    </MenuItem>

                                    <MenuItem value="+91">
                                        🇮🇳 +91
                                    </MenuItem>
                                </Select>

                                <TextField
                                    fullWidth
                                    size="small"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            );

                                        setPhone(value);
                                        setError("");
                                    }}
                                    placeholder={
                                        countryCode === "+1"
                                            ? "(972) 555-0142"
                                            : "9876543210"
                                    }
                                    inputProps={{
                                        maxLength: 10,
                                        inputMode: "numeric",
                                    }}
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

                            {/* =========================================
                                CONSENT
                            ========================================= */}

                            <Box
                                sx={{
                                    backgroundColor: saffronLight,
                                    border: "1px solid rgba(232,113,26,0.25)",
                                    borderRadius: 1.5,
                                    p: 2,
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: navy,
                                        mb: 1,
                                    }}
                                >
                                    Saathi Rides SMS consent — optional
                                </Typography>

                                <FormControlLabel
                                    sx={{
                                        alignItems: "flex-start",
                                        m: 0,
                                    }}
                                    control={
                                        <Checkbox
                                            checked={consent}
                                            onChange={(e) =>
                                                setConsent(
                                                    e.target.checked
                                                )
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
                                            By checking this box, I
                                            voluntarily agree to receive
                                            recurring automated SMS text
                                            messages{" "}
                                            <strong>
                                                directly from Saathi Rides
                                            </strong>{" "}
                                            at the mobile number I provided.

                                            <br />
                                            <br />

                                            I understand that these messages
                                            are from Saathi Rides and relate
                                            to my Saathi Rides account and
                                            activity, including phone
                                            verification, account updates,
                                            ride confirmations, booking
                                            updates, ride matches, ride
                                            requests, and other important
                                            Saathi Rides service
                                            notifications.

                                            <br />
                                            <br />

                                            Message frequency varies.
                                            Message and data rates may apply.

                                            <br />
                                            <br />

                                            <strong>
                                                This consent is optional and
                                                is not required to create,
                                                access, or use my Saathi Rides
                                                account or services.
                                            </strong>

                                            <br />
                                            <br />

                                            I understand that I can withdraw
                                            my SMS consent at any time by
                                            replying{" "}
                                            <strong>STOP</strong> to a
                                            Saathi Rides SMS. I may reply{" "}
                                            <strong>HELP</strong> for
                                            assistance.
                                        </Typography>
                                    }
                                />
                            </Box>

                            {/* =========================================
                                IMPORTANT RELATIONSHIP DISCLOSURE
                            ========================================= */}

                            <Box
                                sx={{
                                    backgroundColor: "#F7F9FC",
                                    border: `1px solid ${border}`,
                                    borderRadius: 1.5,
                                    p: 2,
                                    mb: 2.5,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: navy,
                                        mb: 0.7,
                                    }}
                                >
                                    Who will send these messages?
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: textSecondary,
                                        lineHeight: 1.7,
                                    }}
                                >
                                    <strong>Saathi Rides</strong> will send
                                    the SMS messages described above.
                                    Saathi Rides is the business providing
                                    the ridesharing service and managing your
                                    Saathi Rides account. Your consent on this
                                    page is specifically for messages from
                                    Saathi Rides.
                                </Typography>
                            </Box>

                            {/* =========================================
                                LEGAL LINKS
                            ========================================= */}

                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: textMuted,
                                    lineHeight: 1.7,
                                    mb: 2.5,
                                }}
                            >
                                Your SMS consent is collected separately from
                                acceptance of the{" "}
                                <Link
                                    href="/terms"
                                    underline="hover"
                                    sx={{ color: saffron }}
                                >
                                    Saathi Rides Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link
                                    href="/privacy"
                                    underline="hover"
                                    sx={{ color: saffron }}
                                >
                                    Saathi Rides Privacy Policy
                                </Link>
                                .
                            </Typography>

                            {/* =========================================
                                ERROR
                            ========================================= */}

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                        fontSize: 13,
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* =========================================
                                SUBMIT
                            ========================================= */}

                            <Button
                                fullWidth
                                disabled={!isValid || loading}
                                onClick={handleSubmit}
                                variant="contained"
                                endIcon={
                                    !loading && <ArrowForward />
                                }
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
                                {loading
                                    ? "Saving your Saathi Rides SMS consent..."
                                    : "I Agree to Receive Saathi Rides SMS"}
                            </Button>

                            {/* =========================================
                                DISCLOSURE
                            ========================================= */}

                            <Typography
                                sx={{
                                    mt: 1.5,
                                    fontSize: 12,
                                    color: textMuted,
                                    textAlign: "center",
                                    lineHeight: 1.7,
                                }}
                            >
                                Saathi Rides SMS Notifications
                                <br />
                                Message frequency varies.
                                <br />
                                Msg & data rates may apply.
                                <br />
                                Reply STOP to unsubscribe.
                                <br />
                                Reply HELP for help.
                            </Typography>
                        </>
                    ) : (
                        /* =============================================
                           SUCCESS
                        ============================================= */

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
                                Saathi Rides SMS consent confirmed
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 14,
                                    color: textSecondary,
                                    lineHeight: 1.7,
                                }}
                            >
                                You have successfully opted in to receive
                                SMS messages directly from{" "}
                                <strong>Saathi Rides</strong>.

                                <br />

                                These messages may include phone
                                verification codes, ride confirmations,
                                booking updates, ride matches, ride
                                requests, and important Saathi Rides
                                service notifications.

                                <br />

                                Reply <strong>STOP</strong> at any time to
                                unsubscribe.
                                <br />
                                Reply <strong>HELP</strong> for assistance.
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

                {/* =====================================================
                    HOW IT WORKS
                ===================================================== */}

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
                        How Saathi Rides SMS notifications work
                    </Typography>

                    <Grid container spacing={2.5}>
                        <ComplianceItem
                            icon={<Lock />}
                            title="Your number stays private"
                            text="Saathi Rides does not sell or share your mobile number or SMS consent with third parties for their own marketing."
                        />

                        <ComplianceItem
                            icon={<Block />}
                            title="Cancel anytime"
                            text="Reply STOP to any Saathi Rides SMS to withdraw your SMS consent and stop future recurring messages."
                        />

                        <ComplianceItem
                            icon={<Sms />}
                            title="Messages from Saathi Rides"
                            text="SMS messages are sent by Saathi Rides and relate to your Saathi Rides account, rides, bookings, requests, matches, verification, and service activity."
                        />

                        <ComplianceItem
                            icon={<Help />}
                            title="Need help?"
                            text="Reply HELP to any Saathi Rides SMS or contact support@saathirides.net."
                        />
                    </Grid>
                </Paper>

                {/* =====================================================
                    LEGAL INFORMATION
                ===================================================== */}

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
                        title="Business sending messages:"
                        text="Saathi Rides"
                    />

                    <LegalText
                        title="Business relationship:"
                        text="The recipient is a Saathi Rides user or prospective user interacting directly with Saathi Rides and its ridesharing services."
                    />

                    <LegalText
                        title="Program description:"
                        text="Saathi Rides sends SMS text messages to users who voluntarily opt in to receive phone verification codes, account notifications, ride confirmations, booking updates, ride match notifications, ride request notifications, and other service notifications related to their use of Saathi Rides."
                    />

                    <LegalText
                        title="Message frequency:"
                        text="Message frequency varies based on the user's activity on Saathi Rides. Users may receive multiple messages depending on phone verification, account activity, rides, requests, matches, bookings, and service events."
                    />

                    <LegalText
                        title="Message & data rates:"
                        text="Message and data rates may apply depending on the user's mobile carrier and plan. Saathi Rides does not charge users for receiving SMS messages."
                    />

                    <LegalText
                        title="To stop receiving messages:"
                        text="Reply STOP to any Saathi Rides SMS at any time. After opting out, the user will not receive further recurring messages unless they provide new consent."
                    />

                    <LegalText
                        title="For help:"
                        text="Reply HELP to any Saathi Rides SMS or contact support@saathirides.net."
                    />

                    <LegalText
                        title="SMS consent:"
                        text="SMS consent is voluntary, is collected through this Saathi Rides web form, and is specifically given to Saathi Rides. The user must actively check the consent checkbox before submitting their SMS subscription."
                    />

                    <Typography sx={{ fontSize: 12 }}>
                        For full details see the{" "}
                        <Link
                            href="/privacy"
                            sx={{ color: saffron }}
                        >
                            Saathi Rides Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/terms"
                            sx={{ color: saffron }}
                        >
                            Saathi Rides Terms of Service
                        </Link>
                        .
                    </Typography>
                </Box>
            </Container>

            {/* =========================================================
                FOOTER
            ========================================================= */}

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
                    Community ridesharing built on trust ·
                    saathirides.net
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