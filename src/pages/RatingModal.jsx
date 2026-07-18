import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../Api";

const RatingModal = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [completedRide, setCompletedRide] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
const fetchRides = async () => {
  try {
    const response = await axios.get(`${Api}/rides/get`);

    const completed = response.data.data.find(
      (ride) =>
        ride?.createdBy?._id === user?.id &&
        ride?.travelStatus === "Completed"
    );

    if (completed) {
      setCompletedRide(completed);
      setOpen(true); 
    }
  } catch (error) {
    console.error(error);
  }
};

 useEffect(() => {
  if (user?.id) {
    fetchRides();
  }
}, []);
console.log(user.id,"id")
  const handleSubmit = async () => {
    try {
      await axios.post(`${Api}/rideRating/${user.id}`, {
        rideId: completedRide._id,
        rating,
        review,
      });

      toast.success("Thank you for your feedback!");
      setOpen(false);
    } catch (err) {
      toast.error("Failed to submit rating");
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Rate your ride</DialogTitle>

      <DialogContent>
        <Typography mb={2}>
          How was your ride?
        </Typography>

<Rating
  value={rating}
  onChange={(event, newValue) => setRating(newValue)}
  sx={{
    fontSize: "3.5rem",

    "& .MuiRating-icon": {
      transition: "transform 0.2s ease, color 0.2s ease",
    },

    "& .MuiRating-iconEmpty": {
      color: "#CFCFCF", // Gray initially
    },

    "& .MuiRating-iconFilled": {
      color: "#FFD700", // Gold after selection
    },

    "& .MuiRating-iconHover": {
      color: "#FFD700", // Gold while hovering
      transform: "scale(1.2)",
    },
  }}
/>

        <TextField
          fullWidth
          multiline
          rows={4}
          sx={{ mt: 2 }}
          placeholder="Write your feedback..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>
          Close
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingModal;