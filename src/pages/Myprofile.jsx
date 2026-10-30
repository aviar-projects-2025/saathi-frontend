import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Stack,
  Switch,
} from "@mui/material";
import { useUser } from "../context/userConetext.jsx";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";
import { useNavigate } from "react-router-dom";
import LegalModal from "../components/LegalModal.jsx"; // ★ IMPORT THE NEW MODAL

/* ── Design Tokens ── */
const RUST = "#C83F08";
const RUST_DARK = "#A93205";
const NAVY = "#1B2A4E";
const BG = "#FAF8F5";
const BORDER = "#E7E0D8";
const TEXT_PRIMARY = "#1F2937";
const TEXT_MUTED = "#6B7280";

/* ── Reusable Section Wrapper ── */
const Section = ({ title, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      p: { xs: 2.5, sm: 3.5 },
      mb: 2.5,
      borderRadius: 2.5,
      border: `1px solid ${BORDER}`,
      bgcolor: "#fff",
      boxSizing: "border-box",
      ...sx,
    }}
  >
    {title && (
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, mb: 2.5 }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

/* ── Row: text left, control right (FULL WIDTH) ── */
const Row = ({ children, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: 2,
      ...sx,
    }}
  >
    {children}
  </Box>
);

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

const MyProfileSettings = () => {
  const navigate = useNavigate();
  const toasts = ToastConfig();
  const { currentUser } = useUser();

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
    // Slight delay before clearing content so it doesn't flash during close animation
    setTimeout(() => {
      setModalTitle("");
      setModalContent(null);
    }, 300);
  };

  /* ── SMS Preferences State ── */
  const [smsPrefs, setSmsPrefs] = useState({
    rideRequests: true,
    referralApprovals: true,
    routeAlerts: true,
    communityNews: false,
  });

  const handlePrefChange = (key) => (event) => {
    setSmsPrefs((prev) => ({ ...prev, [key]: event.target.checked }));
  };

  const handleCopy = (value) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!", toasts);
  };

  const handleShare = () => {
    const message = `Join me on Saathi Rides using my invite code: ${currentUser?.referralCode || ""}`;
    if (navigator.share) {
      navigator.share({ title: "Saathi Invite", text: message }).catch(() => { });
    } else {
      navigator.clipboard.writeText(message);
      toast.success("Invite message copied!", toasts);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion requested. Support will contact you.", toasts);
    }
  };

  /* ── Switch styling ── */
  const switchSx = {
    flexShrink: 0,
    "& .MuiSwitch-switchBase.Mui-checked": { color: RUST },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: RUST },
    "& .MuiSwitch-track": { bgcolor: "#D1D5DB" },
  };

  return (
    <Box sx={{
      bgcolor: BG,
      minHeight: "100vh",
      py: { xs: 1, sm: 2 },
      px: { xs: 1, sm: 2 }
    }}>
      <Box sx={{ maxWidth: 900, mx: "auto", width: "100%" }}>

        {/* ─── Page Header ─── */}
        <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, color: NAVY, mb: 3 }}>
          Settings
        </Typography>

        {/* ─── 1. Account ─── */}
        <Section title="Account">
          <Stack spacing={0}>
            {/* Mobile Row */}
            <Row sx={{ py: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Mobile number
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                <Typography sx={{ fontSize: 14, color: TEXT_MUTED }}>
                  {currentUser?.mobile ? `+1 (***) ***-${currentUser.mobile.slice(-4)}` : "+1 (***) ***-XXXX"}
                </Typography>
                <Button
                  onClick={() => navigate("/user-profile")}
                  disableRipple
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: RUST,
                    fontSize: 14,
                    minWidth: 0,
                    p: 0,
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                  }}
                >
                  Change
                </Button>
              </Box>
            </Row>

            <Divider sx={{ borderColor: BORDER }} />

            {/* Email Row */}
            <Row sx={{ py: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                  Email
                </Typography>
                <Typography sx={{ fontSize: 13, color: TEXT_MUTED }}>
                  (optional, never shown)
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, color: TEXT_MUTED, flexShrink: 0 }}>
                {currentUser?.email || "Not provided"}
              </Typography>
            </Row>
          </Stack>
        </Section>

        {/* ─── 2. Your Invite Code ─── */}
        <Section title="Your invite code">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              width: "100%",
            }}
          >
            {/* The Code Input */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                px: 2.5,
                py: 1.75,
                bgcolor: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                fontSize: 15,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: 0.5,
                fontFamily: "monospace",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              {currentUser?.referralCode || "NOT_SET"}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
              <Button
                variant="contained"
                disableElevation
                onClick={() => handleCopy(currentUser?.referralCode)}
                sx={{
                  bgcolor: RUST,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  height: 48,
                  borderRadius: 1.5,
                  minWidth: 100,
                  "&:hover": { bgcolor: RUST_DARK },
                }}
              >
                Copy
              </Button>
              <Button
                variant="outlined"
                onClick={handleShare}
                sx={{
                  color: RUST,
                  borderColor: RUST,
                  borderWidth: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  height: 48,
                  borderRadius: 1.5,
                  minWidth: 100,
                  "&:hover": { borderWidth: 1.5, bgcolor: "#FFF5EC" },
                }}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Section>

        {/* ─── 3. SMS Preferences ─── */}
        <Section title="Text message (SMS) preferences">
          <Stack spacing={0}>
            {/* Row 1 */}
            <Row sx={{ py: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                  Ride requests and acceptances
                </Typography>
                <Typography sx={{ fontSize: 13, color: TEXT_MUTED, mt: 0.25 }}>
                  Needed for rides to work
                </Typography>
              </Box>
              <Switch
                checked={smsPrefs.rideRequests}
                onChange={handlePrefChange("rideRequests")}
                sx={switchSx}
              />
            </Row>
            <Divider sx={{ borderColor: BORDER }} />

            {/* Row 2 */}
            <Row sx={{ py: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Referral approval requests
              </Typography>
              <Switch
                checked={smsPrefs.referralApprovals}
                onChange={handlePrefChange("referralApprovals")}
                sx={switchSx}
              />
            </Row>
            <Divider sx={{ borderColor: BORDER }} />

            {/* Row 3 */}
            <Row sx={{ py: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Route alerts
              </Typography>
              <Switch
                checked={smsPrefs.routeAlerts}
                onChange={handlePrefChange("routeAlerts")}
                sx={switchSx}
              />
            </Row>
            <Divider sx={{ borderColor: BORDER }} />

            {/* Row 4 */}
            <Row sx={{ py: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Community news and tips
              </Typography>
              <Switch
                checked={smsPrefs.communityNews}
                onChange={handlePrefChange("communityNews")}
                sx={switchSx}
              />
            </Row>
          </Stack>

          <Typography sx={{ fontSize: 12.5, color: TEXT_MUTED, mt: 2, lineHeight: 1.6 }}>
            Message and data rates may apply. Reply STOP to opt out, HELP for help. Verification codes are always sent.
          </Typography>
        </Section>

        {/* ─── 4. Legal Links ─── */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2, sm: 2.5 },
            mb: 2.5,
            borderRadius: 2.5,
            border: `1px solid ${BORDER}`,
            bgcolor: "#fff",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 4 },
            }}
          >
            <Typography
              component="button"
              onClick={() => handleOpenModal("Community Guidelines", GUIDELINES_CONTENT)}
              sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", background: "none", border: "none", cursor: "pointer", p: 0, "&:hover": { textDecoration: "underline" } }}
            >
              Community guidelines
            </Typography>
            <Typography
              component="button"
              onClick={() => handleOpenModal("Privacy Policy", PRIVACY_CONTENT)}
              sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", background: "none", border: "none", cursor: "pointer", p: 0, "&:hover": { textDecoration: "underline" } }}
            >
              Privacy Policy
            </Typography>
            <Typography
              component="button"
              onClick={() => handleOpenModal("SMS Terms", SMS_TERMS_CONTENT)}
              sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", background: "none", border: "none", cursor: "pointer", p: 0, "&:hover": { textDecoration: "underline" } }}
            >
              SMS terms
            </Typography>
            <Typography
              component="button"
              onClick={() => handleOpenModal("Terms of Service", TERMS_CONTENT)}
              sx={{
                fontSize: 13.5,
                color: RUST,
                fontWeight: 700,
                textDecoration: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                p: 0,
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Terms of Service
            </Typography>
          </Box>
        </Paper>

        {/* ─── 5. Delete Account ─── */}
        {/* <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 2.5,
            border: `1px solid #F4C7C3`,
            bgcolor: "#FDF2F2",
            boxSizing: "border-box",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#991B1B", mb: 1 }}>
            Delete my account
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "#7A1F1A", mb: 3, lineHeight: 1.6 }}>
            Removes your profile and posts. Reviews you wrote stay anonymously. Members you vouched for keep their access. This can't be undone.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            onClick={handleDeleteAccount}
            sx={{
              bgcolor: "#991B1B",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 3.5,
              py: 1.25,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#7A1F1A" },
            }}
          >
            Delete account
          </Button>
        </Paper> */}

      </Box>

      {/* ★ Render the Legal Modal */}
      <LegalModal
        open={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        content={modalContent}
      />
    </Box>
  );
};

export default MyProfileSettings;