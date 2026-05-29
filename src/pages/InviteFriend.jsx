import React, { useEffect, useRef, useState } from "react";

const validCodes = ["MEENA1", "PRIYA47", "RAHUL22", "DEMO47", "TEST99"];

export default function InviteFlow() {
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("join");
  const [refCode, setRefCode] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("+1");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [name, setName] = useState("");
  const [newCode, setNewCode] = useState("PS2847");
  const [langs, setLangs] = useState(["Hindi", "English"]);

  const otpRefs = useRef([]);

  const progress = [25, 50, 75, 90, 100][step];

  const isCodeValid = refCode.length >= 6 && validCodes.includes(refCode);
  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;
  const isOtpFull = otp.every(Boolean);

  useEffect(() => {
    if (step !== 2) return;

    setTimer(30);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => otpRefs.current[0]?.focus(), 300);

    return () => clearInterval(interval);
  }, [step]);

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setOtpError(false);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKey = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError(false);
    setTimer(30);
    setCanResend(false);
    otpRefs.current[0]?.focus();
  };

  const verifyOtp = () => {
    if (otp.join("") === "123456") {
      setOtpError(false);
      setStep(3);
    } else {
      setOtpError(true);
    }
  };

  const toggleLang = (lang) => {
    setLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const createAccount = () => {
    const finalName = name.trim() || "Priya Sharma";
    const initials = finalName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    setNewCode(initials + Math.floor(Math.random() * 9000 + 1000));
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] px-4 py-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#1A1F3A]">
      <div className="mx-auto max-w-[380px]">
        {/* Progress */}
        <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-[#F0E6DC]">
          <div
            className="h-full rounded-full bg-[#E87722] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dots */}
        <div className="mb-7 flex justify-center gap-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === item
                  ? "w-6 bg-[#E87722]"
                  : step > item
                  ? "w-2 bg-[#0D6B3C]"
                  : "w-2 bg-[#F0E6DC]"
              }`}
            />
          ))}
        </div>

        {/* Step 0 */}
        {step === 0 && (
          <div className="rounded-2xl border border-[#F0E6DC] bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🤝</div>

            <h1 className="mb-2 font-['Sora',sans-serif] text-2xl font-bold">
              Join Saathi
            </h1>

            <p className="mb-6 text-sm leading-6 text-[#555577]">
              Community-only ridesharing. You need a referral code from a
              trusted member to join.
            </p>

            <div className="mb-6 flex overflow-hidden rounded-xl border border-[#F0E6DC]">
              <button
                onClick={() => setTab("join")}
                className={`flex-1 px-3 py-2 text-sm font-bold ${
                  tab === "join"
                    ? "bg-[#E87722] text-white"
                    : "bg-[#FFF8F2] text-[#555577]"
                }`}
              >
                I have a code
              </button>

              <button
                onClick={() => setTab("invite")}
                className={`flex-1 px-3 py-2 text-sm font-bold ${
                  tab === "invite"
                    ? "bg-[#E87722] text-white"
                    : "bg-[#FFF8F2] text-[#555577]"
                }`}
              >
                Invite someone
              </button>
            </div>

            {tab === "join" ? (
              <>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#555577]">
                  Referral code
                </label>

                <input
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  placeholder="e.g. PRIYA47"
                  className={`mb-2 w-full rounded-xl border bg-[#FFF8F2] px-4 py-3 text-lg font-bold uppercase tracking-widest outline-none ${
                    refCode.length >= 6 && !isCodeValid
                      ? "border-red-500"
                      : "border-[#F0E6DC] focus:border-[#E87722]"
                  }`}
                />

                {refCode.length >= 6 && !isCodeValid && (
                  <p className="mb-3 text-xs text-red-500">
                    That code doesn't exist. Ask your contact for their code.
                  </p>
                )}

                <button
                  disabled={!isCodeValid}
                  onClick={() => setStep(1)}
                  className="mt-3 w-full rounded-xl bg-[#E87722] py-3 font-bold text-white disabled:bg-[#F0E6DC]"
                >
                  Continue →
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm leading-6 text-[#555577]">
                  Share your personal code with someone you trust. They can only
                  join through you.
                </p>

                <div className="mb-4 flex items-center justify-between rounded-xl border border-dashed border-[#FFB366] bg-[#FFF3E8] p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#555577]">
                      Your code
                    </p>
                    <p className="font-['Sora',sans-serif] text-2xl font-bold tracking-widest text-[#E87722]">
                      DEMO47
                    </p>
                  </div>

                  <button className="rounded-lg bg-[#E87722] px-4 py-2 text-xs font-bold text-white">
                    Copy
                  </button>
                </div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#555577]">
                  Send invite via SMS
                </label>

                <div className="mb-3 flex gap-2">
                  <select className="rounded-xl border border-[#F0E6DC] bg-[#FFF8F2] px-3 py-3 text-sm outline-none">
                    <option>🇺🇸 +1</option>
                    <option>🇮🇳 +91</option>
                  </select>

                  <input
                    placeholder="(972) 555-0142"
                    className="w-full rounded-xl border border-[#F0E6DC] bg-[#FFF8F2] px-4 py-3 text-sm outline-none focus:border-[#E87722]"
                  />
                </div>

                <button className="w-full rounded-xl bg-[#E87722] py-3 font-bold text-white">
                  Send invite SMS →
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#0D6B3C]/20 bg-[#E8F5EE] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D6B3C] text-sm font-bold text-white">
                MR
              </div>
              <p className="text-sm">
                Invited by{" "}
                <span className="font-bold text-[#0D6B3C]">Meena Reddy</span>
                <br />
                <span className="text-xs text-[#555577]">
                  Dallas Telugu community · ⭐ 4.9 · 23 rides
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-[#F0E6DC] bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">📱</div>

              <h1 className="mb-2 font-['Sora',sans-serif] text-2xl font-bold">
                Your phone number
              </h1>

              <p className="mb-6 text-sm leading-6 text-[#555577]">
                We'll send a 6-digit code to verify it's really you. No spam,
                ever.
              </p>

              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#555577]">
                Mobile number
              </label>

              <div className="mb-4 flex gap-2">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-xl border border-[#F0E6DC] bg-[#FFF8F2] px-3 py-3 text-sm outline-none"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(972) 555-0142"
                  className="w-full rounded-xl border border-[#F0E6DC] bg-[#FFF8F2] px-4 py-3 text-sm outline-none focus:border-[#E87722]"
                />
              </div>

              <button
                disabled={!isPhoneValid}
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-[#E87722] py-3 font-bold text-white disabled:bg-[#F0E6DC]"
              >
                Send verification code →
              </button>

              <p className="mt-3 text-center text-xs text-[#555577]">
                Standard SMS rates may apply
              </p>
            </div>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="rounded-2xl border border-[#F0E6DC] bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🔐</div>

            <h1 className="mb-2 font-['Sora',sans-serif] text-2xl font-bold">
              Enter your code
            </h1>

            <p className="mb-6 text-sm leading-6 text-[#555577]">
              We sent a 6-digit code to {country} {phone}.
            </p>

            <div className="mb-4 flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKey(e, index)}
                  className={`h-14 w-11 rounded-xl border bg-[#FFF8F2] text-center font-['Sora',sans-serif] text-xl font-bold outline-none ${
                    digit ? "border-[#E87722]" : "border-[#F0E6DC]"
                  } ${otpError ? "border-red-500" : ""}`}
                />
              ))}
            </div>

            {otpError && (
              <p className="mb-3 text-center text-xs text-red-500">
                Incorrect code. Try again or resend.
              </p>
            )}

            <p className="mb-4 text-center text-sm text-[#555577]">
              Didn't get it?{" "}
              <button
                disabled={!canResend}
                onClick={resendOtp}
                className="font-bold text-[#E87722] disabled:opacity-40"
              >
                Resend
              </button>
              {!canResend && (
                <span>
                  {" "}
                  in <span className="font-bold text-[#E87722]">{timer}</span>s
                </span>
              )}
            </p>

            <button
              disabled={!isOtpFull}
              onClick={verifyOtp}
              className="w-full rounded-xl bg-[#E87722] py-3 font-bold text-white disabled:bg-[#F0E6DC]"
            >
              Verify →
            </button>

            <p className="mt-3 text-center text-xs text-[#555577]">
              Demo code: <b>123456</b>
            </p>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="rounded-2xl border border-[#F0E6DC] bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">👤</div>

            <h1 className="mb-2 font-['Sora',sans-serif] text-2xl font-bold">
              Set up your profile
            </h1>

            <p className="mb-6 text-sm leading-6 text-[#555577]">
              This helps community members know and trust you.
            </p>

            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#555577]">
              Full name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Sharma"
              className="mb-4 w-full rounded-xl border border-[#F0E6DC] bg-[#FFF8F2] px-4 py-3 text-sm outline-none focus:border-[#E87722]"
            />

            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#555577]">
              City
            </label>

            <select className="mb-4 w-full rounded-xl border border-[#F0E6DC] bg-[#FFF8F2] px-4 py-3 text-sm outline-none">
              <option>Dallas, TX</option>
              <option>Chicago, IL</option>
              <option>Houston, TX</option>
              <option>New Jersey, NJ</option>
              <option>Bay Area, CA</option>
            </select>

            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#555577]">
              Languages you speak
            </label>

            <div className="mb-5 flex flex-wrap gap-2">
              {[
                "Hindi",
                "English",
                "Gujarati",
                "Telugu",
                "Tamil",
                "Punjabi",
                "Marathi",
                "Kannada",
              ].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLang(lang)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    langs.includes(lang)
                      ? "border-[#E87722] bg-[#FFF3E8] text-[#E87722]"
                      : "border-[#F0E6DC] bg-[#FFF8F2] text-[#555577]"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={createAccount}
              className="w-full rounded-xl bg-[#E87722] py-3 font-bold text-white"
            >
              Create my account →
            </button>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <>
            <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#0D6B3C] bg-[#E8F5EE] text-3xl">
              ✅
            </div>

            <div className="mb-6 text-center">
              <h1 className="font-['Sora',sans-serif] text-2xl font-bold">
                Welcome to Saathi!
              </h1>
              <p className="mt-1 text-sm text-[#555577]">
                You're now a verified community member.
              </p>
            </div>

            <div className="mb-4 rounded-2xl border border-[#F0E6DC] bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#555577]">
                Your trust chain
              </p>

              {[
                ["SK", "Suresh Kumar", "Community founder · Dallas", "#1A1F3A"],
                ["MR", "Meena Reddy", "Referred you · ⭐ 4.9", "#0D6B3C"],
                ["PS", "You", "Just joined · Phone verified ✓", "#E87722"],
              ].map(([av, title, sub, color]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 border-b border-[#F0E6DC] py-3 last:border-0"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {av}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{title}</p>
                    <p className="text-xs text-[#555577]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#F0E6DC] bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-sm font-bold">Your referral code</h2>
              <p className="mb-3 text-sm text-[#555577]">
                Invite someone you trust to join Saathi
              </p>

              <div className="flex items-center justify-between rounded-xl border border-dashed border-[#FFB366] bg-[#FFF3E8] p-4">
                <p className="font-['Sora',sans-serif] text-2xl font-bold tracking-widest text-[#E87722]">
                  {newCode}
                </p>

                <button className="rounded-lg bg-[#E87722] px-4 py-2 text-xs font-bold text-white">
                  Copy
                </button>
              </div>
            </div>

            <button className="mt-4 w-full rounded-xl bg-[#E87722] py-3 font-bold text-white">
              Next: build the ride board ↗
            </button>
          </>
        )}
      </div>
    </div>
  );
}