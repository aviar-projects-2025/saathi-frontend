import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Chip,
    Button,
    IconButton,
    Avatar,
    Stack,
    Collapse,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import WcIcon from '@mui/icons-material/Wc';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// ── Design tokens ────────────────────────────────────────────────────────
const TOKENS = {
    paper: '#FAF6EC',
    paperDim: '#F1EADA',
    ink: '#1C2B33',
    inkSoft: '#5B6B72',
    accent: '#C9622A',
    accentSoft: '#F3E1D2',
    amber: '#D69A2D',
    amberSoft: '#FBEFD7',
    green: '#3D7A46',
    greenSoft: '#E4EFDD',
    red: '#B23B3B',
    redSoft: '#F8E4E1',
    line: '#E2D7C3',
    displayFont: "'Space Grotesk', 'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    monoFont: "'IBM Plex Mono', monospace",
};

const travelIcon = {
    Car: DirectionsCarIcon,
    Bike: TwoWheelerIcon,
};

const genderIcon = {
    Any: Diversity3Icon,
    'Male only': WcIcon,
    'Female only': WcIcon,
};

const statusStamp = {
    ACTIVE: { label: 'ACTIVE', color: TOKENS.green, bg: TOKENS.greenSoft },
    COMPLETED: { label: 'COMPLETED', color: TOKENS.inkSoft, bg: TOKENS.paperDim },
    CANCELLED: { label: 'VOID', color: TOKENS.red, bg: TOKENS.redSoft },
};

function requestVisual(status) {
    switch (status?.toUpperCase()) {
        case 'ACCEPTED':
        case 'APPROVED':
            return { label: 'Approved', color: TOKENS.green, bg: TOKENS.greenSoft };
        case 'REJECTED':
            return { label: 'Rejected', color: TOKENS.red, bg: TOKENS.redSoft };
        default:
            return { label: 'Pending', color: TOKENS.amber, bg: TOKENS.amberSoft };
    }
}

function stationCode(name = '') {
    const clean = name.trim();
    if (!clean) return '—';
    const words = clean.split(/\s+/);
    if (words.length === 1) return clean.slice(0, 3).toUpperCase();
    return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

const formFrom = (ride) => ride?.from || ride?.source || '—';
const formTo = (ride) => ride?.to || ride?.destination || '—';

// ── Perforated tear-line (the signature ticket element) ─────────────────
function Perforation() {
    return (
        <Box sx={{ position: 'relative', my: { xs: 2, sm: 2.5 } }}>
            <Box
                sx={{
                    borderTop: `2px dashed ${TOKENS.line}`,
                    mx: { xs: -2.5, sm: -4 },
                }}
            />
            {[0, 1].map((side) => (
                <Box
                    key={side}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        [side === 0 ? 'left' : 'right']: { xs: -27, sm: -39 },
                        transform: 'translateY(-50%)',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: 'background.default',
                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                    }}
                />

            ))}
        </Box>
    );
}

// ── A single ticket field (label + mono value) ───────────────────────────
function Field({ icon: Icon, label, value, span }) {
    return (
        <Box sx={{ gridColumn: span ? '1 / -1' : 'auto' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.4 }}>
                <Icon sx={{ fontSize: { xs: 13, sm: 14 }, color: TOKENS.accent }} />
                <Typography
                    sx={{
                        fontFamily: TOKENS.bodyFont,
                        fontSize: { xs: '0.62rem', sm: '0.66rem' },
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: TOKENS.inkSoft,
                    }}
                >
                    {label}
                </Typography>
            </Stack>
            <Typography
                sx={{
                    fontFamily: TOKENS.monoFont,
                    fontWeight: 600,
                    fontSize: { xs: '0.85rem', sm: '0.95rem' },
                    color: TOKENS.ink,
                    wordBreak: 'break-word',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

// ── Passenger / request stub row ─────────────────────────────────────────
function PassengerStub({ request, onApprove, onReject, approveLoading, rejectLoading, dense }) {
    const [open, setOpen] = useState(false);
    const v = requestVisual(request?.status);
    const isPending = request?.status?.toUpperCase() === 'PENDING';
    console.log(request, 'requestrequest')
    const firstName = request.requestedBy?.firstName || request?.data?.requestBy?.requestedBy?.firstName || 'U';
    const lastName = request.requestedBy?.lastName || '';
    const profilePic = request.requestedBy?.profileImage
    const seats = request?.approvedSeats || 1;
    const pendingReq = request?.pendingReqSeats || 0;

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    borderRadius: 1.5,
                    bgcolor: 'background.default',
                    border: `1px solid ${TOKENS.line}`,
                    borderLeft: `4px solid ${v.color}`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        p: { xs: 1.1, sm: 1.4 },
                    }}
                >
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                            src={profilePic}
                            sx={{
                                width: { xs: 32, sm: 38 },
                                height: { xs: 32, sm: 38 },
                                bgcolor: TOKENS.ink,
                                color: TOKENS.paper,
                                fontFamily: TOKENS.displayFont,
                                fontWeight: 700,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            }}
                        >
                            {firstName[0]}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                noWrap
                                sx={{
                                    fontFamily: TOKENS.bodyFont,
                                    fontWeight: 700,
                                    fontSize: { xs: '0.82rem', sm: '0.9rem' },
                                    color: TOKENS.ink,
                                }}
                            >
                                {firstName} {lastName}
                            </Typography>
                            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.3 }}>
                                <EventSeatIcon sx={{ fontSize: 13, color: TOKENS.inkSoft }} />
                                <Typography sx={{ fontFamily: TOKENS.monoFont, fontSize: '0.7rem', color: TOKENS.inkSoft }}>
                                    SEAT × {seats}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
                        {isPending ? (
                            dense ? (
                                <>
                                    <IconButton
                                        aria-label="Approve request"
                                        onClick={() => onApprove(request._id)}
                                        disabled={
                                            approveLoading === request._id ||
                                            rejectLoading === request._id
                                        }
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: TOKENS.greenSoft,
                                            color: TOKENS.green,
                                            '&:hover': { bgcolor: TOKENS.green, color: '#fff' },
                                        }}
                                    >
                                        {
                                            approveLoading === request._id ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : (
                                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                                            )
                                        }
                                    </IconButton>
                                    <IconButton
                                        aria-label="Reject request"
                                        onClick={() => onReject(request._id)}
                                        disabled={
                                            approveLoading === request._id ||
                                            rejectLoading === request._id
                                        }
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: TOKENS.redSoft,
                                            color: TOKENS.red,
                                            '&:hover': { bgcolor: TOKENS.red, color: '#fff' },
                                        }}
                                    >
                                        {
                                            rejectLoading === request._id ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : (
                                                <CancelIcon sx={{ fontSize: 16 }} />
                                            )
                                        }
                                    </IconButton>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="small"
                                        onClick={() => onApprove(request._id)}
                                        disabled={
                                            approveLoading === request._id ||
                                            rejectLoading === request._id
                                        }
                                        // startIcon={
                                        //     approveLoading === request._id ? (
                                        //         <CircularProgress size={16} color="inherit" />
                                        //     ) : (
                                        //         <CheckCircleIcon sx={{ fontSize: 16 }} />
                                        //     )
                                        // }
                                        sx={{
                                            fontFamily: TOKENS.bodyFont,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            color: TOKENS.green,
                                            bgcolor: TOKENS.greenSoft,
                                            borderRadius: 5,
                                            px: 1.4,
                                            '&:hover': { bgcolor: TOKENS.green, color: '#fff' },
                                        }}
                                    >
                                        {approveLoading === request._id ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => onReject(request._id)}
                                        disabled={
                                            approveLoading === request._id ||
                                            rejectLoading === request._id
                                        }
                                        // startIcon={
                                        //     rejectLoading === request._id ? (
                                        //         <CircularProgress size={16} color="inherit" />
                                        //     ) : (
                                        //         <CancelIcon sx={{ fontSize: 16 }} />
                                        //     )
                                        // }
                                        sx={{
                                            fontFamily: TOKENS.bodyFont,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            color: TOKENS.red,
                                            bgcolor: TOKENS.redSoft,
                                            borderRadius: 5,
                                            px: 1.4,
                                            '&:hover': { bgcolor: TOKENS.red, color: '#fff' },
                                        }}
                                    >
                                        {rejectLoading === request._id ? "Rejecting..." : "Reject"}
                                    </Button>
                                </>
                            )
                        ) : (
                            <Chip
                                label={v.label}
                                size="small"
                                sx={{
                                    bgcolor: v.bg,
                                    color: v.color,
                                    fontFamily: TOKENS.bodyFont,
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                }}
                            />
                        )}
                        <IconButton size="small" onClick={() => setOpen((o) => !o)} aria-label="Toggle passenger details">
                            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Stack>
                </Box>
                <Collapse in={open}>
                    <Box sx={{ px: { xs: 1.4, sm: 1.8 }, pb: 1.4, pt: 0, borderTop: `1px dashed ${TOKENS.line}` }}>
                        <Stack spacing={0.6} sx={{ mt: 1.2 }}>
                            <Typography sx={{ fontFamily: TOKENS.bodyFont, fontSize: '0.8rem', color: TOKENS.ink }}>
                                <strong>Message:</strong> {request.message || 'No message'}
                            </Typography>
                            <Typography sx={{ fontFamily: TOKENS.bodyFont, fontSize: '0.8rem', color: TOKENS.ink }}>
                                <strong>Phone:</strong> {request.phone || 'Not provided'}
                            </Typography>
                            {request.members?.length > 0 && (
                                <>
                                    <Typography sx={{ fontFamily: TOKENS.bodyFont, fontSize: '0.8rem', fontWeight: 700 }}>
                                        Members:
                                    </Typography>
                                    {request.members.map((m, i) => (
                                        <Typography key={i} sx={{ fontFamily: TOKENS.bodyFont, fontSize: '0.78rem', ml: 2 }}>
                                            • {m.name} ({m.age} yrs)
                                        </Typography>
                                    ))}
                                </>
                            )}
                        </Stack>
                    </Box>
                </Collapse>
            </Box>

            {pendingReq > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        m: 1,
                        borderRadius: 2,
                        bgcolor: "rgba(255,0,0,0.08)", // light red background
                        border: "1px solid rgba(255,0,0,0.4)",
                    }}
                >
                    {/* Left Side - Warning + Text */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WarningAmberIcon sx={{ color: "error.main" }} />

                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: "error.main",
                            }}
                        >
                            {firstName} {lastName} requested +{pendingReq}{" "}
                            {pendingReq > 1 ? "seats" : "seat"}
                        </Typography>
                    </Box>

                    {/* Right Side - Actions */}
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                            sx={{
                                color: "green",
                                bgcolor: "rgba(0,200,0,0.1)",
                                "&:hover": { bgcolor: "rgba(0,200,0,0.2)" },
                            }}
                            onClick={() => onApprove(request._id)}
                        >
                            <CheckCircleIcon />
                        </IconButton>

                        <IconButton
                            sx={{
                                color: "red",
                                bgcolor: "rgba(255,0,0,0.1)",
                                "&:hover": { bgcolor: "rgba(255,0,0,0.2)" },
                            }}
                            onClick={() => onReject(request._id)}
                        >
                            <CancelIcon />
                        </IconButton>
                    </Box>
                </Box>
            )}
        </>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────
export default function RideDetailsModal({
    ride,
    requests = [],
    showEdit,
    user,
    showDelete,
    onEdit,
    onDelete,
    onClose,
    onApprove = () => { },
    onReject = () => { },
    approveLoading,
    rejectLoading,
}) {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));

    const startDate = new Date(ride.startTime);
    const dateLabel = !isNaN(startDate)
        ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';
    const timeLabel = !isNaN(startDate)
        ? startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        : '—';

    const stamp = statusStamp[ride?.status] || statusStamp.ACTIVE;
    const TravelIcon = travelIcon[ride.modeOfTravel] || DirectionsCarIcon;
    const GenderIcon = genderIcon[ride.genderPreference] || Diversity3Icon;
    const pendingCount = requests.filter((r) => r?.status?.toUpperCase() === 'PENDING').length;

    return (
        <Dialog
            open
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            fullScreen={isXs}
            PaperProps={{
                sx: {
                    borderRadius: { xs: 3, sm: 4 },
                    bgcolor: TOKENS.paper,
                    backgroundImage: 'none',
                },
            }}
            sx={{ p: 1.5 }}
        >
            {/* ── Ticket header ── */}
            <Box
                sx={{
                    position: 'relative',
                    px: { xs: 2.5, sm: 4 },
                    pt: { xs: 2.5, sm: 3 },
                    pb: { xs: 2, sm: 2.5 },
                    bgcolor: TOKENS.ink,
                    color: TOKENS.paper,
                }}
            >
                <IconButton
                    onClick={onClose}
                    aria-label="Close"
                    sx={{
                        position: 'absolute',
                        right: { xs: 10, sm: 16 },
                        top: { xs: 10, sm: 16 },
                        color: TOKENS.paper,
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        bgcolor: 'rgba(255,255,255,0.08)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: { xs: 1.5, sm: 2 } }}>
                    <ConfirmationNumberIcon sx={{ fontSize: { xs: 15, sm: 17 }, color: TOKENS.accent }} />
                    <Typography
                        sx={{
                            fontFamily: TOKENS.bodyFont,
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'rgba(250,246,236,0.7)',
                        }}
                    >
                        Ride Pass
                    </Typography>
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 2 } }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontFamily: TOKENS.displayFont,
                                fontWeight: 700,
                                fontSize: { xs: '1.9rem', sm: '2.4rem' },
                                lineHeight: 1,
                            }}
                        >
                            {stationCode(formFrom(ride))}
                        </Typography>
                        <Typography
                            noWrap
                            sx={{
                                fontFamily: TOKENS.bodyFont,
                                fontSize: { xs: '0.68rem', sm: '0.75rem' },
                                color: 'rgba(250,246,236,0.65)',
                                mt: 0.3,
                                maxWidth: { xs: 100, sm: 140 },
                            }}
                        >
                            {formFrom(ride)}
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative', top: -8 }}>
                        <Box sx={{ flex: 1, borderTop: '2px dashed rgba(250,246,236,0.35)' }} />
                        <FlightTakeoffIcon sx={{ fontSize: { xs: 16, sm: 19 }, color: TOKENS.accent, transform: 'rotate(90deg)' }} />
                        <Box sx={{ flex: 1, borderTop: '2px dashed rgba(250,246,236,0.35)' }} />
                    </Box>

                    <Box sx={{ minWidth: 0, textAlign: 'right' }}>
                        <Typography
                            sx={{
                                fontFamily: TOKENS.displayFont,
                                fontWeight: 700,
                                fontSize: { xs: '1.9rem', sm: '2.4rem' },
                                lineHeight: 1,
                            }}
                        >
                            {stationCode(formTo(ride))}
                        </Typography>
                        <Typography
                            noWrap
                            sx={{
                                fontFamily: TOKENS.bodyFont,
                                fontSize: { xs: '0.68rem', sm: '0.75rem' },
                                color: 'rgba(250,246,236,0.65)',
                                mt: 0.3,
                                maxWidth: { xs: 100, sm: 140 },
                                ml: 'auto',
                            }}
                        >
                            {formTo(ride)}
                        </Typography>
                    </Box>
                </Box>

                <Chip
                    label={stamp.label}
                    size="small"
                    sx={{
                        position: 'absolute',
                        right: { xs: 14, sm: 20 },
                        bottom: { xs: -12, sm: -14 },
                        bgcolor: stamp.bg,
                        color: stamp.color,
                        fontFamily: TOKENS.monoFont,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        letterSpacing: '0.05em',
                        border: `1.5px solid ${stamp.color}`,
                        transform: 'rotate(-4deg)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                />
            </Box>

            <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 3, sm: 3.5 } }}>
                {/* ── Ticket data fields ── */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                        gap: { xs: 2, sm: 2.5 },
                    }}
                >
                    <Field icon={CalendarTodayIcon} label="Date" value={dateLabel} />
                    <Field icon={AccessTimeIcon} label="Time" value={timeLabel} />
                    <Field icon={TravelIcon} label="Mode" value={ride.modeOfTravel || '—'} />
                    <Field icon={EventSeatIcon} label="Seats avail." value={ride.availableSeats ?? ride.seats ?? '—'} />
                    <Field icon={GenderIcon} label="Gender pref." value={ride.genderPreference || 'Any'} />
                    <Field
                        icon={LocalGasStationIcon}
                        label="Fuel share"
                        value={ride.fuelSharing ? (ride.fuelAmount ? `₹${ride.fuelAmount}/rider` : 'Yes') : 'No'}
                    />
                    {ride.description && (
                        <Field icon={DescriptionIcon} label="Notes" value={ride.description} span />
                    )}
                </Box>

                {requests.length > 0 && (
                    <>
                        <Perforation />

                        <Box>

                            {requests.length === 0 ? (
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        py: 3,
                                        border: `1px dashed ${TOKENS.line}`,
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography sx={{ fontFamily: TOKENS.bodyFont, fontSize: '0.85rem', color: TOKENS.inkSoft }}>
                                        No requests yet
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.6 }}>
                                        <Stack direction="row" spacing={0.8} alignItems="center">
                                            <Typography
                                                sx={{
                                                    fontFamily: TOKENS.displayFont,
                                                    fontWeight: 700,
                                                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                                    color: TOKENS.ink,
                                                }}
                                            >
                                                Passenger Manifest
                                            </Typography>
                                            {pendingCount > 0 && (
                                                <Chip
                                                    label={`${pendingCount} pending`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: TOKENS.amberSoft,
                                                        color: TOKENS.amber,
                                                        fontFamily: TOKENS.bodyFont,
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                        <Typography sx={{ fontFamily: TOKENS.monoFont, fontSize: '0.9 rem', color: TOKENS.inkSoft, mx: 2 }}>
                                            {requests.length} total
                                        </Typography>
                                    </Stack>

                                    <Box
                                        sx={{
                                            // border: `1px solid ${TOKENS.line}`,
                                            borderRadius: 1.5,
                                            maxHeight: { xs: 280, sm: 340 },
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                        }}
                                    >
                                        {requests.map((req, idx) => (
                                            <Box
                                                key={req._id}
                                                sx={{
                                                    // borderTop: idx === 0 ? 'none' : `1px solid ${TOKENS.line}`,
                                                    mt: 2
                                                }}
                                            >
                                                <PassengerStub
                                                    request={req}
                                                    onApprove={onApprove}
                                                    onReject={onReject}
                                                    approveLoading={approveLoading}
                                                    rejectLoading={rejectLoading}
                                                    dense={isXs}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </>
                )}

            </DialogContent>

            {/* ── Actions ── */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    px: { xs: 2.5, sm: 4 },
                    py: { xs: 2, sm: 2.5 },
                    borderTop: `1px solid ${TOKENS.line}`,
                }}
            >
                {showEdit && ride.createdBy._id == user?.id && (
                    <Button
                        onClick={() => onEdit(ride)}
                        startIcon={<EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        size={isMd ? 'medium' : 'small'}
                        sx={{
                            fontFamily: TOKENS.bodyFont,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: { xs: '0.8rem', sm: '0.88rem' },
                            color: TOKENS.ink,
                            border: `1.5px solid ${TOKENS.ink}`,
                            borderRadius: 5,
                            px: { xs: 1.6, sm: 2.2 },
                            minHeight: { xs: 40, sm: 44 },
                            flex: { xs: '1 1 auto', sm: '0 0 auto' },
                            '&:hover': { bgcolor: TOKENS.ink, color: TOKENS.paper },
                        }}
                    >
                        Edit ride
                    </Button>
                )}
                {showDelete && ride.createdBy._id == user?.id && (
                    <Button
                        onClick={() => onDelete(ride)}
                        startIcon={<DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        size={isMd ? 'medium' : 'small'}
                        sx={{
                            fontFamily: TOKENS.bodyFont,
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: { xs: '0.8rem', sm: '0.88rem' },
                            color: TOKENS.red,
                            border: `1.5px solid ${TOKENS.red}`,
                            borderRadius: 5,
                            px: { xs: 1.6, sm: 2.2 },
                            minHeight: { xs: 40, sm: 44 },
                            flex: { xs: '1 1 auto', sm: '0 0 auto' },
                            '&:hover': { bgcolor: TOKENS.red, color: '#fff' },
                        }}
                    >
                        Delete ride
                    </Button>
                )}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
                <Button
                    onClick={onClose}
                    size={isMd ? 'medium' : 'small'}
                    sx={{
                        fontFamily: TOKENS.bodyFont,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: { xs: '0.8rem', sm: '0.88rem' },
                        color: TOKENS.inkSoft,
                        border: `1.5px solid ${TOKENS.line}`,
                        borderRadius: 5,
                        px: { xs: 1.6, sm: 2.2 },
                        minHeight: { xs: 40, sm: 44 },
                        flex: { xs: '1 1 auto', sm: '0 0 auto' },
                        '&:hover': { bgcolor: TOKENS.paperDim },
                    }}
                >
                    Close
                </Button>
            </Box>
        </Dialog>
    );
}