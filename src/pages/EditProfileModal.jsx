import react from 'react'

function EditProfileModal (){
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

  const handleAdjustCancel = () => {
    setShowAdjustModal(false);
    setRawImage("");
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };
  const [profileImage, setProfileImage] = useState(
    currentUser?.profileImage || "",
  );
  const [profileFile, setProfileFile] = useState(null);
      const [showAdjustModal, setShowAdjustModal] = useState(false);
      const [rawImage, setRawImage] = useState(""); // dataURL of the freshly picked file
        const [zoom, setZoom] = useState(1)
      const handleAdjustCancel = () => {
    setShowAdjustModal(false);
    setRawImage("");
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };
    const handleAdjustSave = () => {
    const { scale } = getDisplayedSize();

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = CROP_BOX_SIZE / scale;

    ctx.drawImage(
      cropImgRef.current,
      sx,
      sy,
      sSize,
      sSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        setProfileFile(file);
        setProfileImage(previewUrl);

        setShowAdjustModal(false);
        setRawImage("");
      },
      "image/jpeg",
      0.92,
    );
  };

return(
     <Modal
        open={editProfile}
        children={
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: "92%", sm: "100%" },
              px: { xs: 2, sm: 0 },
            }}
          >
            <Box
              sx={{
                bgcolor: "white",
                width: { xs: "100%", sm: "85%", md: 480, lg: 500 },
                maxWidth: 500,
                borderRadius: 2,
                boxShadow: 24,
                p: { xs: 2, sm: 3 },
                maxHeight: { xs: "85vh", sm: "90vh" },
                overflowY: "auto",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                  }}
                >
                  Edit Profile
                </Typography>

                <IconButton
                  aria-label="close"
                  onClick={() => setEditProfile(false)}
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ width: "100%" }}>
                <Stack alignItems="center" spacing={2}>
                  <Avatar
                    src={profileImage || formData.profileImage || ""}
                    sx={{
                      width: { xs: 60, sm: 75, md: 90 },
                      height: { xs: 60, sm: 75, md: 90 },
                      fontSize: { xs: 18, sm: 24, md: 32 },
                      bgcolor: SAFFRON,
                    }}
                  >
                    {!profileImage &&
                      !formData.profileImage &&
                      `${formData?.firstName?.[0] || ""}${formData?.lastName?.[0] || ""}`}
                  </Avatar>

                  <Button
                    variant="contained"
                    component="label"
                    size="small"
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                      textTransform: "none",
                      color: "#ffff",
                      bgcolor: "#FF9933",
                    }}
                  >
                    Change Photo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handlePickImage}
                    />
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ width: "100%" }}
                >
                  <TextField
                    name="firstName"
                    label="First Name"
                    size="small"
                    fullWidth
                    value={formData?.firstName}
                    onChange={handleChange}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />

                  <TextField
                    label="Last Name"
                    name="lastName"
                    size="small"
                    fullWidth
                    value={formData?.lastName}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    onChange={handleChange}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ width: "100%" }}
                >
                  <TextField
                    label="Email"
                    name="email"
                    size="small"
                    fullWidth
                    value={formData?.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  />

                  <TextField
                    label="Mobile Number"
                    name="mobile"
                    size="small"
                    fullWidth
                    value={formData?.mobile || ""}
                    onChange={(e) => {
                      let value = e.target.value;
                      value = value
                        .replace(/[^\d+]/g, "")
                        .replace(/(?!^)\+/g, "")
                        .slice(0, 16);

                      handleChange({ target: { name: "mobile", value } });
                    }}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                    inputProps={{ maxLength: 16 }}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ width: "100%" }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData?.dob}
                      onChange={(newValue) => {
                        setFormData((prev) => ({ ...prev, dob: newValue }));
                        setErrors((prev) => ({ ...prev, dob: "" }));
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!errors.dob,
                          helperText: errors.dob,
                          fullWidth: true,
                          InputProps: {
                            sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                          },
                          InputLabelProps: {
                            sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                          },
                        },
                      }}
                      sx={{ width: { xs: "100%", sm: "48%" } }}
                    />
                  </LocalizationProvider>

                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    size="small"
                    fullWidth
                    sx={{ width: { xs: "100%", sm: "48%" } }}
                    value={formData?.gender}
                    onChange={handleChange}
                    error={!!errors.gender}
                    helperText={errors.gender}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  >
                    <MenuItem
                      value="Male"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Male
                    </MenuItem>
                    <MenuItem
                      value="Female"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Female
                    </MenuItem>
                    <MenuItem
                      value="Other"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Other
                    </MenuItem>
                  </TextField>
                </Stack>

                <TextField
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData?.bio}
                  error={!!errors.bio}
                  helperText={errors.bio}
                  onChange={handleChange}
                  InputProps={{
                    sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                  }}
                />
                <TextField
                  label="ZipCode"
                  name="zipcode"
                  fullWidth
                  value={formData?.zipcode || ""}

                  error={!!errors.zipcode}
                  helperText={errors.zipcode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      zipcode: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      zipcode: "",
                    }));
                  }}
                  inputProps={{ maxLength: 16 }}
                  InputProps={{
                    sx: {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    },
                  }}
                />

                <Stack
                  direction={{ xs: "row", sm: "row" }}
                  spacing={{ xs: 1, sm: 1.5 }}
                  sx={{
                    width: "100%",
                    mt: { xs: 0.5, sm: 1 },
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      py: { xs: 0.5, sm: 0.75 },
                      px: { xs: 1.5, sm: 2.5 },
                      minWidth: { xs: "auto", sm: 90 },
                      bgcolor: "#757575",
                      color: "#ffff",
                      textTransform: "none",
                    }}
                    onClick={() => {
                      setProfileImage("");
                      resetForm();
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      py: { xs: 0.5, sm: 0.75 },
                      px: { xs: 1.5, sm: 2.5 },
                      minWidth: { xs: "auto", sm: 110 },
                      bgcolor: "#FF9933",
                      color: "#fff",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#ef9104" },
                    }}
                    onClick={handleUpdateProfile}
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        }
      />

      {/* ── Adjust Photo Modal (shows selected image, drag + zoom, then submit) ── */}
      <Modal open={showAdjustModal} onClose={handleAdjustCancel}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "62%", sm: 340 },
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            outline: "none",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: "1.05rem",
            }}
          >
            Adjust Photo
          </Typography>

          <IconButton
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

          {/* Draggable / zoomable preview box */}
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
              width: { xs: 190, sm: CROP_BOX_SIZE },
              height: { xs: 190, sm: CROP_BOX_SIZE },
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
                  width: getDisplayedSize().displayedW || "auto",
                  height: getDisplayedSize().displayedH || "auto",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>

          {/* Zoom slider */}
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Zoom
            </Typography>
            <Slider
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
              sx={{ bgcolor: "#757575", color: "#fff", textTransform: "none" }}
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
)
}

export default EditProfileModal;
  