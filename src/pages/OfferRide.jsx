import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, FormControlLabel, Switch, Slider,
  Stack, Chip, Alert, Stepper, Step, StepLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';


const steps = ['Trip details', 'Preferences', 'Review & post'];

const languageOptions = ['Hindi', 'Gujarati', 'Tamil', 'Telugu', 'Punjabi', 'Marathi', 'Bengali', 'Kannada', 'Malayalam', 'English'];

export default function OfferRide() {
  // const { addRide } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: 'offering',
    category: 'airport',
    from: '',
    to: '',
    date: '',
    time: '',
    seats: 2,
    price: '',
    priceType: 'per person',
    luggageOk: false,
    recurring: false,
    description: '',
    languages: ['Hindi', 'English'],
    tags: [],
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleLanguage = lang => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  // const handleSubmit = () => {
  //   addRide({
  //     ...form,
  //     price: form.price === '' ? null : Number(form.price),
  //     tags: [form.category, ...(form.luggageOk ? ['Luggage OK'] : []), ...(form.recurring ? ['Recurring'] : [])],
  //     duration: 'TBD',
  //   });
  //   setSubmitted(true);
  // };

  if (submitted) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 6, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 72, color: '#52B788', mb: 2 }} />
        <Typography variant="h5" fontWeight={800} gutterBottom>Ride posted! 🙏</Typography>
        <Typography color="text.secondary" mb={3}>
          Your ride is now visible to the Saathi community. You'll get notified when someone requests or messages you.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => navigate('/my-rides')}>View my rides</Button>
          <Button variant="contained" onClick={() => navigate('/')}>Browse community rides</Button>
        </Stack>
      </Box>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={800}>
          {form.type === 'offering' ? 'Offer a Ride' : 'Request a Ride'}
        </Typography>
      </Box>

      {/* Type toggle */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {[{ label: '🚗 I\'m offering a ride', value: 'offering' }, { label: '🙏 I need a ride', value: 'needs' }].map(opt => (
          <Button
            key={opt.value}
            variant={form.type === opt.value ? 'contained' : 'outlined'}
            onClick={() => update('type', opt.value)}
            sx={{ flex: 1, fontWeight: 600 }}
          >
            {opt.label}
          </Button>
        ))}
      </Stack>

      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.8rem' } }}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {step === 0 && (
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Ride type</InputLabel>
              <Select value={form.category} label="Ride type" onChange={e => update('category', e.target.value)}>
                <MenuItem value="airport">✈️ Airport</MenuItem>
                <MenuItem value="intercity">🛣️ Intercity</MenuItem>
                <MenuItem value="local">📍 Local</MenuItem>
                <MenuItem value="temple">🛕 Temple / Event</MenuItem>
              </Select>
            </FormControl>
            <TextField label="From" fullWidth size="small" value={form.from} onChange={e => update('from', e.target.value)} placeholder="Plano, TX" />
            <TextField label="To" fullWidth size="small" value={form.to} onChange={e => update('to', e.target.value)} placeholder="DFW Airport — Terminal D" />
            <Stack direction="row" spacing={2}>
              <TextField label="Date" fullWidth size="small" type="date" value={form.date} onChange={e => update('date', e.target.value)} inputlabelprops={{ shrink: true }} />
              <TextField label="Time" fullWidth size="small" type="time" value={form.time} onChange={e => update('time', e.target.value)} inputlabelprops={{ shrink: true }} />
            </Stack>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              size="small"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="E.g. Returning from ORD pickup, have 2 spare seats. Parents with luggage welcome."
            />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Available seats: {form.seats}
              </Typography>
              <Slider
                value={form.seats}
                onChange={(_, v) => update('seats', v)}
                min={1} max={7} step={1}
                marks
                valueLabelDisplay="auto"
                sx={{ color: 'primary.main' }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Price</Typography>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="0 = Free"
                  value={form.price}
                  onChange={e => update('price', e.target.value)}
                  InputProps={{ startAdornment: <span style={{ marginRight: 4 }}>$</span> }}
                  sx={{ width: 120 }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select value={form.priceType} onChange={e => update('priceType', e.target.value)}>
                    <MenuItem value="per person">Per person</MenuItem>
                    <MenuItem value="total">Total</MenuItem>
                    <MenuItem value="Gas + tolls">Gas + tolls</MenuItem>
                    <MenuItem value="Negotiable">Negotiable</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Languages spoken</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {languageOptions.map(lang => (
                  <Chip
                    key={lang}
                    label={lang}
                    onClick={() => toggleLanguage(lang)}
                    variant={form.languages.includes(lang) ? 'filled' : 'outlined'}
                    size="small"
                    sx={{
                      bgcolor: form.languages.includes(lang) ? 'primary.main' : 'transparent',
                      color: form.languages.includes(lang) ? '#fff' : 'text.secondary',
                      borderColor: '#E0D5CC',
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch checked={form.luggageOk} onChange={e => update('luggageOk', e.target.checked)} color="primary" />}
                label="Luggage OK"
              />
              <FormControlLabel
                control={<Switch checked={form.recurring} onChange={e => update('recurring', e.target.checked)} color="primary" />}
                label="Recurring ride (e.g. weekly temple run)"
              />
            </Stack>
          </Stack>
        )}

        {step === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Your ride will be visible to community members in your network and beyond. Only verified members can message you.
            </Alert>
            <Stack spacing={1.5}>
              {[
                ['Type', `${form.type === 'offering' ? '🚗 Offering' : '🙏 Needs ride'} · ${form.category}`],
                ['From → To', `${form.from || '—'} → ${form.to || '—'}`],
                ['Date & Time', `${form.date || '—'} at ${form.time || '—'}`],
                ['Seats', form.seats],
                ['Price', form.price === '' ? 'Not set' : form.price == 0 ? 'Free' : `$${form.price} ${form.priceType}`],
                ['Languages', form.languages.join(', ') || '—'],
                ['Luggage OK', form.luggageOk ? 'Yes' : 'No'],
                ['Recurring', form.recurring ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid #F0E6DC' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                </Box>
              ))}
              {form.description && (
                <Box sx={{ bgcolor: '#FFF8F2', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>DESCRIPTION</Typography>
                  <Typography variant="body2" mt={0.5}>{form.description}</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* Navigation */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          {step > 0 && (
            <Button variant="outlined" onClick={() => setStep(s => s - 1)} sx={{ flex: 1 }}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button variant="contained" onClick={() => setStep(s => s + 1)} sx={{ flex: 1 }}>
              Continue
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmit} sx={{ flex: 1, bgcolor: '#52B788', '&:hover': { bgcolor: '#2D6A4F' } }}>
              🙏 Post ride to community
            </Button>
          )}
        </Stack>
      </Paper>
      
    </PageLayout>
  );
}
