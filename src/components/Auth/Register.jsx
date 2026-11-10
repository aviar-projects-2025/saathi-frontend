import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import CloseIcon from "@mui/icons-material/Close";

import Api from "../../Api";
import US_Cities from "../../config/US_Cities.json";
import ToastConfig from "../ToastConfig";
import uploadToCloudinary from "../uploadToCloudinary";
import { uploadImageToS3 } from "../../utils/s3Upload";
import ProtectedAvatar from "../ProtectedAvatar";
import LegalModal from "../LegalModal";

const ORANGE = "#C83F08";
const NAVY = "#132858";
const BG = "#FAF8F5";

const CROP_BOX_SIZE = 260;
const CROP_BOX_SIZE_MOBILE = 190;
const OUTPUT_SIZE = 500;

const LANGUAGES = [
  "Tamil",
  "English",
  "Hindi",
  "Telugu",
  "Gujarati",
  "Punjabi",
  "Malayalam",
  "Kannada",
  "Marathi",
  "Bengali",
];

// Same city/state options used by EditProfile.
const EXCLUDED = ["AS", "FM", "GU", "MH", "MP", "PW", "PR", "VI", "AE", "AP"];

const OPTIONS = US_Cities
  .filter((state) => !EXCLUDED.includes(state.abbr))
  .flatMap((state) =>
    state.cities.map((city) => ({
      city,
      state: state.state,
      abbr: state.abbr,
      label: `${city}, ${state.state}`,
    }))
  );

const OTHER_OPTION = {
  city: "Other",
  state: "",
  abbr: "OTHER",
  label: "Other (my city is not listed)",
};

const AUTOCOMPLETE_OPTIONS = [...OPTIONS, OTHER_OPTION];

const filterCityOptions = (options, { inputValue }) => {
  const words = inputValue.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = [];

  for (const option of options) {
    if (option.abbr === "OTHER") continue;

    const searchable = `${option.city} ${option.state} ${option.abbr}`.toLowerCase();
    if (words.every((word) => searchable.includes(word))) {
      matches.push(option);
      if (matches.length === 50) break;
    }
  }

  return [...matches, OTHER_OPTION];
};

const Register = () => {
  const navigate = useNavigate();
  const toasts = ToastConfig();
  const [searchParams] = useSearchParams();

  const invitationToken = searchParams.get("ref") || "";

  const [step, setStep] = useState(0);
  const [invitation, setInvitation] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [invitationError, setInvitationError] = useState("");

  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const fullMobileNumber = `${countryCode}${mobileNumber}`;

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  const [registrationCredential, setRegistrationCredential] = useState("");

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOtherCity, setIsOtherCity] = useState(false);

  /* ---------- Consent checkboxes (controlled) ---------- */
  const [smsConsent, setSmsConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  /* ---------- Photo: matches EditProfile pattern ---------- */
  const [profileFile, setProfileFile] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [rawImage, setRawImage] = useState("");
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cropImgRef = useRef(null);
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 },
  });

  const otpInputRefs = useRef([]);
  const fileInputRef = useRef(null);

  const isProduction =
    import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "production";
  const isTesting =
    import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "testing";

  /* ── Modal State ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  const handleOpenModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setModalTitle("");
      setModalContent(null);
    }, 300);
  };

  /* ── Design Tokens ── */
  const RUST = "#C83F08";
  const RUST_DARK = "#A93205";
  const NAVY = "#1B2A4E";
  const BG = "#FAF8F5";
  const BORDER = "#E7E0D8";
  const TEXT_PRIMARY = "#1F2937";
  const TEXT_MUTED = "#6B7280";

  /* ── Legal Text Content ── */
  const GUIDELINES_CONTENT = (
    <Box>
      <Typography variant="h1">Community Guidelines</Typography>
      <Typography sx={{ fontStyle: "italic", color: TEXT_MUTED, mb: 3 }}>
        Saathi works because every member is here through someone who knows them.
      </Typography>

      <Typography variant="h2">Our values</Typography>
      <ul>
        <li><strong>Trust</strong> — Be someone others can count on.</li>
        <li><strong>Respect</strong> — Treat every member the way you'd want your own family treated.</li>
        <li><strong>Seva</strong> — Help each other, especially newcomers and elders.</li>
        <li><strong>Accountability</strong> — Own your actions and your invitations.</li>
      </ul>

      <Typography variant="h2">1. Be yourself</Typography>
      <p>Use your real name and a clear, recent photo of yourself. Keep your city and profile details accurate. One person, one account. Never share or lend your account. Never impersonate another person.</p>

      <Typography variant="h2">2. Treat everyone with respect</Typography>
      <p>Saathi welcomes members from every state, language, religion, and background in India and across the diaspora. We do not tolerate harassment, bullying, threats, or intimidation. Disagree politely. If a conversation isn't going well, step away.</p>

      <Typography variant="h2">3. Rides — be a good saathi</Typography>
      <p><strong>For everyone:</strong> Be on time. If you're running late, let the other person know right away. Cancel as early as possible. Don't no-show. Keep ride details accurate. Wear your seat belt.</p>
      <p><strong>For drivers:</strong> Drive only with a valid license, registration, and insurance. Never drive after drinking or using drugs. No texting while driving. Charge only your share of costs.</p>
      <p><strong>For passengers:</strong> Be ready at the agreed pickup point. Pay the agreed amount promptly. Respect the driver's car and preferences.</p>
      <p><strong>Women-only rides:</strong> Respect rides marked women-only. Misrepresenting yourself to join one will result in removal from Saathi.</p>

      <Typography variant="h2">4. Caring for elders and visiting parents</Typography>
      <p>Be patient and kind, and help with luggage when you can. Communicate clearly with their family about pickup times and any delays. Never ask an elder for money beyond what was agreed with their family.</p>

      <Typography variant="h2">5. Protect privacy</Typography>
      <p>Use contact details you receive only for the ride or arrangement they were shared for. Never post another member's phone number or personal details publicly.</p>

      <Typography variant="h2">6. Ratings and reviews</Typography>
      <p>Rate based on your actual experience — honestly and fairly. Don't trade ratings, pressure others for good ratings, or leave revenge ratings.</p>

      <Typography variant="h2">7. Marketplace</Typography>
      <p>Describe items and services honestly, with real photos and fair prices. Only sell what you own and are legally allowed to sell. No weapons, drugs, alcohol, or illegal goods.</p>

      <Typography variant="h2">8. Forum</Typography>
      <p>Stay on topic and post in the right category. No political debates. No spam or advertising.</p>

      <Typography variant="h2">9. Events</Typography>
      <p>Organizers: keep event details accurate and update them if plans change. Attendees: RSVP honestly and let organizers know if you can't make it.</p>

      <Typography variant="h2">10. Inviting new members</Typography>
      <p>Only invite people you know personally and trust. Never sell, trade, or publicly post your invite link. Remember that your invitations reflect on you.</p>

      <Typography variant="h2">Reporting a problem</Typography>
      <p>If something feels wrong, tell us. You can tap Report on any profile or ride, or email support@saathirides.net. Reports are confidential and reviewed within 24 hours.</p>
    </Box>
  );

  const PRIVACY_CONTENT = (
    <Box>
      <Typography variant="h1">Privacy Policy</Typography>
      <Typography sx={{ fontStyle: "italic", color: TEXT_MUTED, mb: 3 }}>
        Saathi Rides ("Saathi," "we," "us," or "our") is built on trust, and that includes how we handle your information.
      </Typography>

      <Typography variant="h2">1. Information we collect</Typography>
      <p><strong>Information you give us:</strong> Account details (phone, name, city, photo), optional profile details (languages, profession), referral information, ride details, travel companion details, ratings and reviews, and communications.</p>
      <p><strong>Information collected automatically:</strong> Device and usage information, cookies (no advertising cookies), and location (only if you choose to share it).</p>
      <p><strong>Information from others:</strong> Your referrer, who invited you and approves your membership. Other members through ratings and reviews.</p>

      <Typography variant="h2">2. How we use your information</Typography>
      <p>Verify your phone number, run the referral process, show your profile to others, post and search rides, send text messages, review reports, prevent fraud, improve Saathi, and comply with legal obligations.</p>

      <Typography variant="h2">3. What other members can see</Typography>
      <ul>
        <li>Name, photo, city, languages</li>
        <li>Ratings and completed ride count</li>
        <li>Referral chain (who invited you)</li>
        <li>Role badges (Organizer, Moderator, Founding Member)</li>
        <li>Your rides, listings, and posts</li>
        <li>Phone number masked (last 4 digits only) by default</li>
        <li>Contact details shared only after a ride is accepted</li>
      </ul>

      <Typography variant="h2">4. How we share information</Typography>
      <p>We do not sell your personal information. We share only with other members as described, with your referrer, with service providers (Twilio, MongoDB Atlas, Vercel, Google Maps Platform), for legal and safety reasons, and in a business transfer.</p>
      <p><strong>Mobile information is never shared with third parties for marketing purposes.</strong></p>

      <Typography variant="h2">5. How long we keep information</Typography>
      <p>We keep your information while your account is active. When you delete your account, we delete or de-identify your personal information within 30 days, except for safety records, legal compliance, and backup copies.</p>

      <Typography variant="h2">6. Your choices and rights</Typography>
      <p>Access and update your profile, delete your account from Settings, reply STOP to opt out of texts, turn off location sharing, or request a copy of your data by emailing support@saathirides.net.</p>

      <Typography variant="h2">7. Security</Typography>
      <p>We protect your information with access controls, encrypted connections (HTTPS), role-based permissions, and restricted access to photos and personal data.</p>

      <Typography variant="h2">8. Children</Typography>
      <p>Saathi is only for adults 18 and older. We do not knowingly collect information from anyone under 18.</p>

      <Typography variant="h2">9. Where your information is stored</Typography>
      <p>Your information is stored and processed in the United States.</p>

      <Typography variant="h2">10. Contact us</Typography>
      <p>Saathi Rides — Privacy<br />Email: support@saathirides.net<br />Mail: AVIAR Technology Services, 2103 Eastland Dr, Bloomington, IL 61704</p>
    </Box>
  );

  const SMS_TERMS_CONTENT = (
    <Box>
      <Typography variant="h1">SMS Terms</Typography>
      <Typography sx={{ fontStyle: "italic", color: TEXT_MUTED, mb: 3 }}>
        These SMS Terms explain how Saathi Rides uses text messages.
      </Typography>

      <Typography variant="h2">Program name</Typography>
      <p>Saathi Rides</p>

      <Typography variant="h2">Program description</Typography>
      <p>Saathi sends text messages to members who sign up with their mobile phone number. Messages include login and verification codes, account messages, ride alerts, and community alerts.</p>
      <p>Messages are sent from our verified toll-free number: <strong>+1 (833) 408-9975</strong>.</p>

      <Typography variant="h2">How you opt in</Typography>
      <p>You agree to receive text messages from Saathi when you enter your mobile number on saathirides.net, agree to these SMS Terms, and request a verification code. Consent to receive text messages is not a condition of any purchase.</p>

      <Typography variant="h2">Message frequency</Typography>
      <p>Message frequency varies based on your activity. Verification codes are sent only when you request one. Ride alerts are sent each time they happen. New rides in your city are sent at most once per day. New events are sent at most once per week.</p>

      <Typography variant="h2">Cost</Typography>
      <p>Message and data rates may apply. Check with your mobile carrier for details. Saathi does not charge for text messages.</p>

      <Typography variant="h2">How to opt out</Typography>
      <p>Reply <strong>STOP</strong> to any message to stop receiving texts from Saathi. You will receive one final message confirming you've been unsubscribed.</p>
      <p><em>Please note: Saathi uses text messages for login codes. If you opt out of all messages, you won't be able to receive login codes and may not be able to sign in until you opt back in.</em></p>

      <Typography variant="h2">How to opt back in</Typography>
      <p>Reply <strong>START</strong> to +1 (833) 408-9975 at any time.</p>

      <Typography variant="h2">Help</Typography>
      <p>Reply <strong>HELP</strong> to any message for assistance, or email support@saathirides.net.</p>

      <Typography variant="h2">Privacy</Typography>
      <p>Your mobile number and text messaging consent are used only to operate Saathi. Mobile information will not be shared with third parties for marketing or promotional purposes.</p>
    </Box>
  );

  const TERMS_CONTENT = (
    <Box>
      <Typography variant="h1">Terms of Service</Typography>
      <Typography sx={{ fontStyle: "italic", color: TEXT_MUTED, mb: 3 }}>
        Welcome to Saathi. By using our services, you agree to these terms.
      </Typography>

      <Typography variant="h2">1. Acceptance of Terms</Typography>
      <p>
        By creating an account, accessing, or using Saathi Rides ("Saathi," "we," "us," or "our"), you agree to be bound by these Terms of Service and our Community Guidelines. If you do not agree, you may not use the Service. Saathi is operated by AVIAR Technology Services.
      </p>

      <Typography variant="h2">2. Eligibility and Registration</Typography>
      <p>
        You must be at least 18 years old to create an account. You must provide accurate, current, and complete information during registration, including your real name, valid mobile number, and a recent photo. You are responsible for maintaining the confidentiality of your login codes. One person, one account. You may not share or transfer your account to anyone else.
      </p>

      <Typography variant="h2">3. Referral and Invite System</Typography>
      <p>
        Saathi operates on an invite-only basis. When you join, you are vouched for by your referrer. When you invite others, you vouch for them. You may only invite individuals you know personally and trust. You may not sell, trade, or publicly post your invite link. If a member you invited is suspended or banned, you will be notified, and repeated issues may lead to a review of your own account.
      </p>

      <Typography variant="h2">4. Rides and Cost-Sharing</Typography>
      <p>
        Saathi is a platform for community members to coordinate shared rides. <strong>Saathi is not a transportation provider, taxi service, or common carrier.</strong> We do not employ drivers, own vehicles, or provide transportation services.
      </p>
      <p>
        <strong>Drivers:</strong> You must hold a valid driver's license, vehicle registration, and insurance. You must drive safely and comply with all traffic laws. You may only charge a cost-sharing amount, which must not exceed the limit shown in the app. You may not use Saathi to operate a commercial transportation business.
      </p>
      <p>
        <strong>Passengers:</strong> You agree to be ready at the agreed pickup location and time, and to pay the agreed cost share promptly. You must respect the driver's vehicle and rules.
      </p>
      <p>
        <strong>Cancellations:</strong> Cancel as early as possible. Repeated no-shows or cancellations within 2 hours of departure may result in account restrictions.
      </p>

      <Typography variant="h2">5. Travel Buddy Program</Typography>
      <p>
        Saathi offers a Travel Buddy feature to help connect members traveling on the same flights. Companions are volunteers, not caregivers, guardians, or escorts. They do not provide professional medical or custodial care. The family is responsible for approving each companion. Saathi is not responsible for the actions, omissions, or conduct of any Travel Buddy companion.
      </p>

      <Typography variant="h2">6. Marketplace and Forum</Typography>
      <p>
        Any marketplace listings, event posts, or forum posts must comply with our Community Guidelines. You may not sell illegal items, weapons, drugs, alcohol, or offer professional services (like tax or legal advice) without proper licensing. Saathi is not a party to any transaction between members. Any advice shared on the forum is from community members, not professionals.
      </p>

      <Typography variant="h2">7. Community Conduct and Safety</Typography>
      <p>
        You agree to treat all members with respect, as outlined in our Community Guidelines. Saathi has a zero-tolerance policy for harassment, discrimination, hate speech, or unsafe driving. We reserve the right to suspend or permanently ban any member who violates these rules. In an emergency, always call 911 first.
      </p>

      <Typography variant="h2">8. SMS Notifications</Typography>
      <p>
        By providing your mobile number, you consent to receive SMS messages from Saathi for login codes, ride alerts, and account notifications. Standard message and data rates may apply. You can opt out by replying STOP, but doing so may prevent you from logging in. See our full SMS Terms for details.
      </p>

      <Typography variant="h2">9. Disclaimers and Limitation of Liability</Typography>
      <p>
        The Service is provided "as is" and "as available." Saathi does not guarantee the accuracy of member profiles, ride details, or flight information. To the maximum extent permitted by law, Saathi is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to personal injury, property damage, or missed flights.
      </p>

      <Typography variant="h2">10. Indemnification</Typography>
      <p>
        You agree to indemnify, defend, and hold harmless Saathi, its founders, and employees from any claims, damages, liabilities, and expenses arising out of your use of the Service or your violation of these Terms.
      </p>

      <Typography variant="h2">11. Changes to These Terms</Typography>
      <p>
        We may update these Terms from time to time. If we make material changes, we will notify you via the app or SMS before they take effect. Your continued use of Saathi after changes are posted constitutes your acceptance of the new Terms.
      </p>

      <Typography variant="h2">12. Contact Us</Typography>
      <p>
        If you have questions about these Terms, please contact us:<br />
        <strong>Saathi Rides</strong><br />
        Email: support@saathirides.net<br />
        Mail: AVIAR Technology Services, 2103 Eastland Dr, Bloomington, IL 61704
      </p>
    </Box>
  );

  useEffect(() => {
    if (isProduction) setCountryCode("+1");
  }, [isProduction]);

  /* ---------- Validate invitation ---------- */
  useEffect(() => {
    let cancelled = false;

    const validateInvitation = async () => {
      setInvitationLoading(true);
      setInvitationError("");
      setInvitation(null);

      if (!invitationToken) {
        setInvitationError(
          "A valid Saathi Rides invitation link is required."
        );
        setInvitationLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${Api}/referralInvite/validate`,
          { params: { token: invitationToken } }
        );

        if (cancelled) return;

        if (response.data?.success && response.data?.invitation) {
          setInvitation(response.data.invitation);
        } else {
          setInvitationError(
            response.data?.message || "This invitation link is invalid."
          );
        }
      } catch (error) {
        if (!cancelled) {
          setInvitationError(
            error.response?.data?.message ||
            "This invitation is invalid or has expired."
          );
        }
      } finally {
        if (!cancelled) setInvitationLoading(false);
      }
    };

    validateInvitation();

    return () => {
      cancelled = true;
    };
  }, [invitationToken]);

  /* ---------- OTP timer ---------- */
  useEffect(() => {
    if (otpTimer <= 0) return undefined;
    const timer = setTimeout(() => {
      setOtpTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [otpTimer]);

  /* ---------- Cleanup preview URL ---------- */
  useEffect(() => {
    return () => {
      if (profileImage?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  /* ================= Styles ================= */
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#FFFFFF",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#DDD5CC" },
      "&:hover fieldset": { borderColor: ORANGE },
      "&.Mui-focused fieldset": { borderColor: ORANGE },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
  };

  const primaryButtonSx = {
    minHeight: 52,
    borderRadius: "12px",
    backgroundColor: ORANGE,
    color: "#FFFFFF",
    textTransform: "none",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "none",
    "&:hover": { backgroundColor: "#A93205", boxShadow: "none" },
    "&.Mui-disabled": {
      backgroundColor: "#E3C9BE",
      color: "#FFFFFF",
    },
  };

  const headingSx = {
    color: NAVY,
    fontWeight: 800,
    letterSpacing: "-0.4px",
  };

  /* ================= OTP actions ================= */
  const handleSendOtp = async () => {
    if (!invitation || invitationError || invitationLoading) {
      toast.error("Please use a valid invitation link.", toasts);
      return;
    }

    if (!smsConsent) {
      setOtpError(
        "Please agree to receive SMS messages to continue."
      );
      return;
    }

    if (!termsConsent) {
      setOtpError(
        "Please accept the Terms and Privacy Policy to continue."
      );
      return;
    }

    if (mobileNumber.length !== 10) {
      setOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const response = await axios.post(`${Api}/auth/send-otp`, {
        mobileNumber: fullMobileNumber,
        invitationToken,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      setIsOtpVerified(false);
      setOtp("");
      setOtpTimer(60);
      setStep(1);

      toast.success("OTP sent successfully!", toasts);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send OTP";
      setOtpError(message);
      toast.error(message, toasts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const response = await axios.post(`${Api}/auth/verify-otp`, {
        mobileNumber: fullMobileNumber,
        otp,
        invitationToken,
      });

      if (!response.data?.success || !response.data?.registrationCredential) {
        throw new Error(
          response.data?.message || "Could not establish a registration session"
        );
      }

      setRegistrationCredential(response.data.registrationCredential);
      setIsOtpVerified(true);
      setStep(2);

      toast.success("Mobile number verified successfully!", toasts);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Invalid OTP";
      setOtpError(message);
      toast.error(message, toasts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, "");

    if (digits.length > 1) {
      const pastedOtp = digits.slice(0, 6);
      setOtp(pastedOtp);
      const focusIndex = Math.min(pastedOtp.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
      return;
    }

    const updated = otp.split("");
    updated[index] = digits;
    const nextOtp = updated.join("").slice(0, 6);

    setOtp(nextOtp);
    setOtpError("");

    if (digits && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0 || isLoading) return;
    await handleSendOtp();
  };

  /* ================= Photo crop (copied from EditProfile) ================= */
  const getBaseScale = (w, h, cropSize) =>
    w && h ? Math.max(cropSize / w, cropSize / h) : 1;

  const getDisplayedSize = (cropSize) => {
    const baseScale = getBaseScale(naturalSize.w, naturalSize.h, cropSize);
    return {
      displayedW: naturalSize.w * baseScale * zoom,
      displayedH: naturalSize.h * baseScale * zoom,
      scale: baseScale * zoom,
    };
  };

  const clampOffset = (nextOffset, displayedW, displayedH, cropSize) => {
    const minX = cropSize - displayedW;
    const minY = cropSize - displayedH;
    return {
      x: Math.min(0, Math.max(minX, nextOffset.x)),
      y: Math.min(0, Math.max(minY, nextOffset.y)),
    };
  };

  const cropSize = CROP_BOX_SIZE;

  const handleCropImageLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setNaturalSize({ w, h });

    const baseScale = getBaseScale(w, h, cropSize);
    const displayedW = w * baseScale;
    const displayedH = h * baseScale;

    setOffset({
      x: (cropSize - displayedW) / 2,
      y: (cropSize - displayedH) / 2,
    });
  };

  const startDrag = (clientX, clientY) => {
    dragState.current = {
      dragging: true,
      startX: clientX,
      startY: clientY,
      startOffset: { ...offset },
    };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragState.current.dragging) return;
    const { displayedW, displayedH } = getDisplayedSize(cropSize);
    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    const next = {
      x: dragState.current.startOffset.x + dx,
      y: dragState.current.startOffset.y + dy,
    };
    setOffset(clampOffset(next, displayedW, displayedH, cropSize));
  };

  const endDrag = () => {
    dragState.current.dragging = false;
  };

  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e) => moveDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };
  const handleTouchEnd = () => endDrag();

  const handleZoomChange = (e, value) => {
    const { displayedW: oldW, displayedH: oldH } = getDisplayedSize(cropSize);

    if (!oldW || !oldH) {
      setZoom(value);
      return;
    }

    const centerX = cropSize / 2 - offset.x;
    const centerY = cropSize / 2 - offset.y;

    setZoom(value);

    const baseScale = getBaseScale(naturalSize.w, naturalSize.h, cropSize);
    const newW = naturalSize.w * baseScale * value;
    const newH = naturalSize.h * baseScale * value;
    const ratioX = newW / oldW;
    const ratioY = newH / oldH;

    const newOffset = {
      x: cropSize / 2 - centerX * ratioX,
      y: cropSize / 2 - centerY * ratioY,
    };

    setOffset(clampOffset(newOffset, newW, newH, cropSize));
  };

  const handleAdjustSave = () => {
    const { scale } = getDisplayedSize(cropSize);

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = cropSize / scale;

    ctx.drawImage(
      cropImgRef.current,
      sx,
      sy,
      sSize,
      sSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        if (profileImage?.startsWith("blob:")) {
          URL.revokeObjectURL(profileImage);
        }

        setProfileFile(file);
        setProfileImage(previewUrl);

        setShowAdjustModal(false);
        setRawImage("");
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      },
      "image/jpeg",
      0.92
    );
  };

  const handleAdjustCancel = () => {
    setShowAdjustModal(false);
    setRawImage("");
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.", toasts);
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Your photo must be 5 MB or smaller.", toasts);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setShowAdjustModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ================= Validation ================= */
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .trim()
      .min(2, "First name must contain at least 2 characters")
      .max(40, "First name cannot exceed 40 characters")
      .matches(
        /^[\p{L}][\p{L}\s'-]*$/u,
        "First name can contain only letters"
      )
      .required("First name is required"),

    lastName: Yup.string()
      .trim()
      .min(1, "Last name is required")
      .max(40, "Last name cannot exceed 40 characters")
      .matches(
        /^[\p{L}][\p{L}\s'-]*$/u,
        "Last name can contain only letters"
      )
      .required("Last name is required"),

    city: Yup.string()
      .trim()
      .min(2, "Please enter a valid city")
      .max(100, "City name cannot exceed 100 characters")
      .required("City is required"),

    gender: Yup.string().oneOf(
      ["", "Female", "Male", "Other"],
      "Please select a valid gender"
    ),

    languages: Yup.array()
      .of(Yup.string().oneOf(LANGUAGES))
      .max(10, "You can select up to 10 languages"),
  });

  /* ================= Submit ================= */

  const registerSubmit = async (values, { setSubmitting }) => {
    if (!isOtpVerified || !registrationCredential) {
      setServerError("Please verify your mobile number again.");
      setSubmitting(false);
      return;
    }

    if (!invitationToken || !invitation?.referralCode) {
      setServerError("Your invitation is invalid or has expired.");
      setSubmitting(false);
      return;
    }

    if (!profileFile) {
      setServerError("Please add a profile photo to continue.");
      setSubmitting(false);
      return;
    }

    setServerError("");
    setSubmitting(true);

    try {
      const uploaded = await uploadImageToS3(
        profileFile,
        "profiles",
        registrationCredential
      );

      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        gender: values.gender || "",
        mobile: fullMobileNumber,
        city: values.city.trim(),
        languages: values.languages || [],
        language: values.languages || [],
        referralCode: invitation.referralCode,
        invitationToken,
        registrationCredential,
        profileImage: uploaded.key,
        profileImageKey: uploaded.key,
      };

      const response = await axios.post(
        `${Api}/users/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${registrationCredential}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Registration failed."
        );
      }

      setRegistrationCredential("");
      setStep(3);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= Shared brand ================= */
  const renderBrand = () => (
    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 3 }}>
      <Avatar
        sx={{
          width: 34,
          height: 34,
          backgroundColor: ORANGE,
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        S
      </Avatar>
      <Typography
        sx={{
          color: NAVY,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-0.4px",
        }}
      >
        Saathi
      </Typography>
    </Stack>
  );

  /* ================= STEP 0 — invitation ================= */
  const renderInvitationStep = () => (
    <>
      {renderBrand()}

      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={headingSx}>
          You're invited
        </Typography>
        <Typography sx={{ mt: 1, color: "#57534E", lineHeight: 1.55 }}>
          Saathi is a referral-only community. Your invite comes from a
          member who will vouch for you.
        </Typography>
      </Box>

      {invitationLoading ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CircularProgress size={22} sx={{ color: ORANGE }} />
          <Typography>Validating your invitation...</Typography>
        </Paper>
      ) : invitationError ? (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          {invitationError}
        </Alert>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 1.8,
            mb: 3,
            borderRadius: 3,
            borderColor: "#E8DED4",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#FFE0C8",
              color: "#9D350E",
              fontWeight: 800,
              width: 48,
              height: 48,
            }}
          >
            {(invitation?.referrerName || "S")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} color="#25211E">
              {invitation?.referrerName} invited you
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since{" "}
              {invitation?.createdAt
                ? new Date(invitation.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
                : "N/A"}
              {" · "}
              {invitation?.city || "Dallas, TX"}
            </Typography>
          </Box>
        </Paper>
      )}

      <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
        {countryCode === "+1" ? "US" : "International"} mobile number
      </Typography>

      <Stack direction="row" spacing={1}>
        {isProduction && (
          <TextField value="+1" disabled sx={{ width: 74, ...inputSx }} />
        )}

        {isTesting && (
          <TextField
            select
            value={countryCode}
            onChange={(event) => {
              setCountryCode(event.target.value);
              setMobileNumber("");
              setOtp("");
              setIsOtpSent(false);
              setIsOtpVerified(false);
              setOtpError("");
            }}
            sx={{ width: 100, ...inputSx }}
          >
            <MenuItem value="+1">🇺🇸 +1</MenuItem>
            <MenuItem value="+91">🇮🇳 +91</MenuItem>
          </TextField>
        )}

        <TextField
          fullWidth
          placeholder="(555) 010-0142"
          value={mobileNumber}
          disabled={isOtpSent}
          onChange={(event) => {
            setMobileNumber(
              event.target.value.replace(/\D/g, "").slice(0, 10)
            );
            setOtpError("");
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: "#777" }} />
              </InputAdornment>
            ),
          }}
          sx={inputSx}
        />
      </Stack>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 0.7, color: "#625D57" }}
      >
        We will text you a 6-digit code.
      </Typography>

      <FormControlLabel
        sx={{ mt: 2, alignItems: "flex-start" }}
        control={
          <Checkbox
            size="small"
            checked={smsConsent}
            onChange={(e) => {
              setSmsConsent(e.target.checked);
              setOtpError("");
            }}
            sx={{
              color: ORANGE,
              "&.Mui-checked": { color: ORANGE },
              pt: 0.2,
            }}
          />
        }
        label={
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            I agree to receive SMS from Saathi for verification codes and
            ride updates. Message and data rates may apply. Reply STOP to
            opt out, HELP for help.{" "}
            <span
              onClick={() => handleOpenModal("SMS Terms", SMS_TERMS_CONTENT)}
              style={{ color: ORANGE, cursor: "pointer" }}
            >
              SMS terms
            </span>
          </Typography>
        }
      />

      <FormControlLabel
        sx={{ mt: 0.2, mb: 2, alignItems: "flex-start" }}
        control={
          <Checkbox
            size="small"
            checked={termsConsent}
            onChange={(e) => {
              setTermsConsent(e.target.checked);
              setOtpError("");
            }}
            sx={{
              color: ORANGE,
              "&.Mui-checked": { color: ORANGE },
            }}
          />
        }
        label={
          <Typography variant="body2">
            I accept the{" "}
            <span
              onClick={() => handleOpenModal("Terms of Service", TERMS_CONTENT)}
              style={{ color: ORANGE, cursor: "pointer" }}
            >
              Terms
            </span>{" "}
            and{" "}
            <span
              onClick={() => handleOpenModal("Privacy Policy", PRIVACY_CONTENT)}
              style={{ color: ORANGE, cursor: "pointer" }}
            >
              Privacy Policy
            </span>
            .
          </Typography>
        }
      />

      {otpError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {otpError}
        </Alert>
      )}

      <Button
        fullWidth
        onClick={handleSendOtp}
        disabled={
          isLoading ||
          invitationLoading ||
          Boolean(invitationError) ||
          !invitation ||
          mobileNumber.length !== 10 ||
          !smsConsent ||
          !termsConsent
        }
        sx={primaryButtonSx}
      >
        {isLoading ? "Sending code..." : "Send code"}
      </Button>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          color: "#625D57",
          textAlign: "center",
        }}
      >
        Saathi is a community coordination tool, not a licensed
        transportation service.
      </Typography>
    </>
  );

  /* ================= STEP 1 — OTP ================= */
  const renderOtpStep = () => (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => setStep(0)}
        sx={{
          color: ORANGE,
          textTransform: "none",
          fontWeight: 700,
          px: 0,
          mb: 2,
        }}
      >
        Back
      </Button>

      <Typography variant="h4" sx={headingSx}>
        Enter your code
      </Typography>

      <Typography sx={{ mt: 1, color: "#57534E", lineHeight: 1.55 }}>
        We sent a 6-digit code to {countryCode} {mobileNumber}. It expires
        in 10 minutes.
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        sx={{ mt: 3.5, mb: 1.5 }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <TextField
            key={index}
            inputRef={(element) => {
              otpInputRefs.current[index] = element;
            }}
            value={otp[index] || ""}
            onChange={(event) =>
              handleOtpChange(index, event.target.value)
            }
            onKeyDown={(event) => handleOtpKeyDown(index, event)}
            inputProps={{
              inputMode: "numeric",
              maxLength: 1,
              "aria-label": `OTP digit ${index + 1}`,
              style: {
                textAlign: "center",
                fontSize: 23,
                fontWeight: 800,
                padding: "12px 0",
              },
            }}
            sx={{
              width: "16%",
              ...inputSx,
            }}
          />
        ))}
      </Stack>

      <Typography variant="body2" sx={{ color: "#625D57", mb: 2.5 }}>
        Didn't get it?{" "}
        <Button
          onClick={handleResendOtp}
          disabled={otpTimer > 0 || isLoading}
          sx={{
            minWidth: 0,
            p: 0,
            textTransform: "none",
            color: ORANGE,
            fontWeight: 700,
            "&.Mui-disabled": { color: "#B99A8E" },
          }}
        >
          Resend code
        </Button>{" "}
        {otpTimer > 0
          ? `(available in 0:${String(otpTimer).padStart(2, "0")})`
          : ""}
      </Typography>

      {otpError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {otpError}
        </Alert>
      )}

      <Button
        fullWidth
        onClick={handleVerifyOtp}
        disabled={isLoading || otp.length !== 6}
        sx={primaryButtonSx}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </Button>
    </>
  );

  /* ================= STEP 2 — Profile ================= */
  const renderProfileStep = () => {
    const displayed = getDisplayedSize(cropSize);

    return (
      <>
        <Typography variant="h4" sx={headingSx}>
          Create your profile
        </Typography>

        <Typography sx={{ mt: 0.7, mb: 2.5, color: "#57534E" }}>
          Real name and a clear photo help the person who invited you
          approve you.
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handlePickImage}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 76,
              height: 88,
              minWidth: 76,
              border: `2px dashed ${ORANGE}`,
              borderRadius: 3,
              color: ORANGE,
              textTransform: "none",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {profileImage ? (
              <Avatar src={profileImage} sx={{ width: 62, height: 62 }} />
            ) : (
              <>
                <AddAPhotoOutlinedIcon />
                <Typography fontSize={12} fontWeight={700}>
                  Add photo
                </Typography>
              </>
            )}
          </Button>

          <Typography variant="body2" color="#625D57">
            Required. A clear photo of your face. JPG, PNG or WebP, up to
            5 MB.
          </Typography>
        </Stack>

        <Formik
          enableReinitialize
          initialValues={{
            firstName: "",
            lastName: "",
            city: "",
            gender: "",
            languages: ["Tamil", "English"],
          }}
          validationSchema={validationSchema}
          onSubmit={registerSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            setFieldTouched,
          }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {serverError && (
                  <Alert
                    severity="error"
                    onClose={() => setServerError("")}
                    sx={{ borderRadius: 2 }}
                  >
                    {serverError}
                  </Alert>
                )}

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    fullWidth
                    label="First name"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    inputProps={{ maxLength: 40 }}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="Last name"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    inputProps={{ maxLength: 40 }}
                    sx={inputSx}
                  />
                </Stack>

                <Autocomplete
                  fullWidth
                  size="medium"
                  options={AUTOCOMPLETE_OPTIONS}
                  value={
                    isOtherCity
                      ? OTHER_OPTION
                      : OPTIONS.find((option) => option.label === values.city) || null
                  }
                  onChange={(event, newValue) => {
                    const selectedOther = newValue?.abbr === "OTHER";

                    setIsOtherCity(selectedOther);
                    setFieldValue("city", selectedOther ? "" : newValue?.label || "");
                    setFieldTouched("city", true, false);
                  }}
                  onBlur={() => setFieldTouched("city", true)}
                  filterOptions={filterCityOptions}
                  getOptionLabel={(option) => option?.label || ""}
                  isOptionEqualToValue={(option, selected) =>
                    option.abbr === selected.abbr && option.city === selected.city
                  }
                  noOptionsText="No matching city"
                  slotProps={{
                    popper: { sx: { zIndex: 1500 } },
                    listbox: {
                      sx: {
                        maxHeight: 240,
                        overflowY: "auto",
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City, State"
                      placeholder="Search your city or state"
                      error={touched.city && Boolean(errors.city)}
                      helperText={touched.city && errors.city}
                      sx={inputSx}
                    />
                  )}
                />

                {isOtherCity && (
                  <TextField
                    fullWidth
                    label="Enter City, State"
                    name="city"
                    placeholder="Enter your city and state"
                    value={values.city}
                    onChange={(event) => {
                      setFieldValue("city", event.target.value);
                    }}
                    onBlur={() => setFieldTouched("city", true)}
                    error={touched.city && Boolean(errors.city)}
                    helperText={touched.city && errors.city}
                    inputProps={{ maxLength: 100 }}
                    sx={inputSx}
                  />
                )}

                <Box sx={{ width: "100%", minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                    Languages spoken{" "}
                    <Typography component="span" variant="caption">
                      (optional)
                    </Typography>
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.8,
                      width: "100%",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    {LANGUAGES.map((language) => {
                      const selected = values.languages.includes(language);
                      return (
                        <Chip
                          key={language}
                          label={language}
                          clickable
                          onClick={() => {
                            const nextLanguages = selected
                              ? values.languages.filter(
                                (item) => item !== language
                              )
                              : [...values.languages, language];
                            setFieldValue("languages", nextLanguages);
                          }}
                          sx={{
                            borderRadius: "20px",
                            backgroundColor: selected ? ORANGE : "#FFFFFF",
                            color: selected ? "#FFFFFF" : "#25211E",
                            border: "1px solid #DDD5CC",
                            fontWeight: selected ? 700 : 400,
                            fontSize: { xs: 12, sm: 13 },
                            height: { xs: 28, sm: 32 },
                            maxWidth: "100%",
                            "& .MuiChip-label": {
                              px: { xs: 1.2, sm: 1.5 },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                            "&:hover": {
                              backgroundColor: selected ? "#A93205" : "#F3E9E1",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    sx={inputSx}
                  >
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                  <Typography
                    variant="caption"
                    sx={{ color: "#625D57", mt: 0.5 }}
                  >
                    Used only for women-only rides.
                  </Typography>
                </FormControl>

                <TextField
                  fullWidth
                  label="Referral code"
                  value={invitation?.referralCode || ""}
                  disabled
                  sx={inputSx}
                />

                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#E8F0FE",
                    color: "#1A3E8A",
                    "& .MuiAlert-icon": { color: "#1A3E8A" },
                  }}
                >
                  Profile 80% complete. Add a photo to finish. Posting and
                  requesting unlock at 100% and after approval.
                </Alert>

                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting || submitting || !isOtpVerified}
                  sx={{ ...primaryButtonSx, mt: 1 }}
                >
                  {isSubmitting || submitting
                    ? "Submitting..."
                    : "Submit for approval"}
                </Button>
              </Stack>
            </form>
          )}
        </Formik>

        {/* ---- Crop modal ---- */}
        <Modal open={showAdjustModal} onClose={handleAdjustCancel}>
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "80%", sm: 340 },
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, fontSize: "1.05rem" }}
            >
              Adjust Photo
            </Typography>

            <IconButton
              aria-label="close"
              onClick={handleAdjustCancel}
              sx={{
                position: "absolute",
                top: 7,
                right: 10,
                zIndex: 2,
                color: "rgba(0,0,0,0.8)",
                bgcolor: "#fff",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            <Box
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              sx={{
                position: "relative",
                width: cropSize,
                height: cropSize,
                mx: "auto",
                borderRadius: "50%",
                overflow: "hidden",
                bgcolor: "#222",
                cursor: "grab",
                touchAction: "none",
                border: "2px solid #FF9933",
              }}
            >
              {rawImage && (
                <img
                  ref={cropImgRef}
                  src={rawImage}
                  alt="Selected"
                  onLoad={handleCropImageLoad}
                  draggable={false}
                  style={{
                    position: "absolute",
                    left: offset.x,
                    top: offset.y,
                    width: displayed.displayedW || "auto",
                    height: displayed.displayedH || "auto",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                />
              )}
            </Box>

            <Box sx={{ px: 1, mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Zoom
              </Typography>
              <Slider
                aria-label="Zoom"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={handleZoomChange}
                sx={{ color: "#FF9933" }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "#757575",
                  color: "#fff",
                  textTransform: "none",
                }}
                onClick={handleAdjustCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "#FF9933",
                  color: "#fff",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#ef9104" },
                }}
                onClick={handleAdjustSave}
              >
                Use Photo
              </Button>
            </Stack>
          </Box>
        </Modal>
      </>
    );
  };

  /* ================= STEP 3 — Waiting ================= */
  const renderWaitingStep = () => (
    <>
      {renderBrand()}

      <Box
        sx={{
          mt: 2,
          mb: 2,
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#FFF1C2",
          color: "#9C4A0A",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography variant="h4" sx={headingSx}>
        Waiting for {invitation?.referrerName || "your referrer"} to approve
      </Typography>

      <Typography sx={{ mt: 1, color: "#57534E", lineHeight: 1.6 }}>
        We texted {invitation?.referrerName || "your referrer"} to review
        your request. Once they approve, you can find and post rides.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          borderColor: "#E8DED4",
        }}
      >
        {[
          { label: "Phone verified", sub: null },
          { label: "Profile submitted", sub: null },
          {
            label: `Approval from ${invitation?.referrerName || "your referrer"
              }`,
            sub: "Reminder sent after 48 hours. Expires in 14 days.",
          },
        ].map((item, index) => {
          const isDone = index < 2;
          const isCurrent = index === 2;
          return (
            <Stack
              key={item.label}
              direction="row"
              alignItems="flex-start"
              spacing={1.5}
              sx={{ mb: index === 2 ? 0 : 2 }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                  backgroundColor: isDone
                    ? "#176B3A"
                    : isCurrent
                      ? "#FFF1C2"
                      : "#EFEFEF",
                  color: isDone
                    ? "#FFFFFF"
                    : isCurrent
                      ? "#9C4A0A"
                      : "#666",
                  border: isCurrent ? "2px solid #C65B11" : "none",
                }}
              >
                {isDone ? <CheckCircleIcon fontSize="small" /> : index + 1}
              </Avatar>

              <Box sx={{ pt: 0.2 }}>
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                  {item.label}
                </Typography>
                {item.sub && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25 }}
                  >
                    {item.sub}
                  </Typography>
                )}
              </Box>
            </Stack>
          );
        })}
      </Paper>

      <Typography
        variant="body2"
        sx={{ mt: 2.5, color: "#57534E", lineHeight: 1.6 }}
      >
        While you wait you can edit your profile. Browsing, posting and
        requesting are locked until you are approved.
      </Typography>

      <Button
        fullWidth
        onClick={() => navigate("/login")}
        sx={{
          ...primaryButtonSx,
          mt: 3,
          backgroundColor: "#FFFFFF",
          color: ORANGE,
          border: `1.5px solid ${ORANGE}`,
          "&:hover": {
            backgroundColor: "#FFF3EC",
            borderColor: ORANGE,
          },
        }}
      >
        Go to login
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: BG,
        display: "flex",
        justifyContent: "center",
        alignItems: { xs: "flex-start", sm: "center" },
        px: 2,
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Box sx={{ width: "100%" }}>
          {step === 0 && renderInvitationStep()}
          {step === 1 && renderOtpStep()}
          {step === 2 && renderProfileStep()}
          {step === 3 && renderWaitingStep()}
        </Box>
      </Container>

      <LegalModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        content={modalContent}
      />
    </Box>
  );
};

export default Register;