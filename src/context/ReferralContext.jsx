import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Api from "../Api";
import { useNotifications } from "./NotificationContext";

const ReferralContext = createContext();

export const ReferralProvider = ({ children }) => {
  const [pendingReferral, setPendingReferral] = useState([]); // store full list
  const [notificationLengthcount, setNotificationLengthcount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  const { notifications } = useNotifications();

  // 🔹 Fetch pending referrals
  const getPendingReferralCount = async () => {
    try {
      const res = await axios.get(`${Api}/referrals/${user?.id}`);

      const waitingList =
        res?.data?.data?.filter(
          (item) => item.refApprove === "Waiting"
        ) || [];

      setPendingReferral(waitingList);
    } catch (error) {
      console.log("Referral fetch error:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getPendingReferralCount();
    }
  }, [user?.id]);


  useEffect(() => {

    const waitingIds = pendingReferral.map((item) => item._id);


    const notificationIds =
      notifications
        ?.filter((n) => n.type === "referral_pending")
        .map((n) => n.data?.userId || n.data?.user?._id)
        .filter(Boolean) || []; // remove undefined/null


    const uniqueIds = new Set([...waitingIds, ...notificationIds]);


    setNotificationLengthcount(uniqueIds?.size);
  }, [notifications, pendingReferral]);

  return (
    <ReferralContext.Provider
      value={{
        pendingReferral,     
        pendingReferralCount: pendingReferral.length,
        notificationLengthcount,
        getPendingReferralCount,
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = () => useContext(ReferralContext);