import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Card, CardContent,
  ToggleButton, ToggleButtonGroup, Slider, FormControl,
  InputLabel, Select, MenuItem, Chip, Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


const rideTypes = [
  { value: 'airport', label: '✈️ Airport' },
  { value: 'intercity', label: '🚗 Intercity' },
  { value: 'temple', label: '🛕 Temple' },
  { value: 'local', label: '🏙️ Local' },
];

export default function PostRide() {
  const navigate = useNavigate();
  const { addRide, showSnackbar } = useApp();
  const [form, setForm] = useState({
    mode: 'offering', type: 'airport', from: '', to: '',
    date: '', time: '', seats: 2, price: 0, note: '', priceLabel: 'Gas split',
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!form.from || !form.to || !form.date || !form.time) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }
    addRide({
      ...form,
      priceLabel: form.price === 0 ? (form.mode === 'requesting' ? 'Will pay' : 'Gas split') : `$${form.price}/seat`,
      tags: [form.type, ...(form.time < '06:00' || form.time > '22:00' ? ['late-night'] : [])],
    });
    showSnackbar('🎉 Your ride has been posted!');
    navigate('/find');
  };

  return (
    <Box>
      <Box sx={{ background: 'linear-gradient(135deg, #E85D26 0%, #FF8A5B 100%)', pt: 5, pb: 3, px: 2.5, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <Typography variant="h5" fontWeight={800} color="white">Post a Ride</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
          Offer or request a ride from your trusted community
        </Typography>
      </Box>

      <Box px={2} mt={2} pb={12}>
        <Card>
          <CardContent>
            {/* Offer / Request */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>I am…</Typography>
            <ToggleButtonGroup
              value={form.mode} exclusive onChange={(_, v) => v && update('mode', v)}
              fullWidth size="small" sx={{ mb: 3 }}
            >
              <ToggleButton value="offering" sx={{ textTransform: 'none', fontWeight: 600 }}>
                🚗 Offering a Ride
              </ToggleButton>
              <ToggleButton value="requesting" sx={{ textTransform: 'none', fontWeight: 600 }}>
                🙋 Requesting a Ride
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Ride Type */}
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Ride Type</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={3}>
              {rideTypes.map(t => (
                <Chip
                  key={t.value}
                  label={t.label}
                  onClick={() => update('type', t.value)}
                  variant={form.type === t.value ? 'filled' : 'outlined'}
                  color={form.type === t.value ? 'primary' : 'default'}
                  sx={{ fontWeight: form.type === t.value ? 700 : 500 }}
                />
              ))}
            </Stack>

            {/* From / To */}
            <TextField
              fullWidth label="From (City or Area) *" size="small" sx={{ mb: 2 }}
              value={form.from} onChange={e => update('from', e.target.value)}
            />
            <TextField
              fullWidth label="To (City, Airport, or Temple) *" size="small" sx={{ mb: 2 }}
              value={form.to} onChange={e => update('to', e.target.value)}
            />

            {/* Date/Time */}
            <Box display="flex" gap={2} mb={3}>
              <TextField fullWidth label="Date *" type="date" size="small"
                InputLabelProps={{ shrink: true }} value={form.date} onChange={e => update('date', e.target.value)} />
              <TextField fullWidth label="Time *" type="time" size="small"
                InputLabelProps={{ shrink: true }} value={form.time} onChange={e => update('time', e.target.value)} />
            </Box>

            {/* Seats */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Available Seats: <strong style={{ color: '#E85D26' }}>{form.seats}</strong>
            </Typography>
            <Slider
              value={form.seats} min={1} max={6}
              onChange={(_, v) => update('seats', v)}
              marks step={1} color="primary" sx={{ mb: 3 }}
            />

            {/* Price */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Price</InputLabel>
              <Select value={form.price} label="Price" onChange={e => update('price', e.target.value)}>
                <MenuItem value={0}>Free / Gas Split</MenuItem>
                <MenuItem value={10}>$10 per seat</MenuItem>
                <MenuItem value={20}>$20 per seat</MenuItem>
                <MenuItem value={30}>$30 per seat</MenuItem>
                <MenuItem value={40}>$40 per seat</MenuItem>
                <MenuItem value={50}>$50 per seat</MenuItem>
              </Select>
            </FormControl>

            {/* Note */}
            <TextField
              fullWidth multiline rows={3} label="Additional Notes"
              placeholder="Luggage, language preference, pickup details..."
              value={form.note} onChange={e => update('note', e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button fullWidth variant="contained" size="large" onClick={handleSubmit}>
              Post Ride
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
