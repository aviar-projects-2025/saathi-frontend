import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Api from "../Api";

const ReferralContext = createContext();

export const ReferralProvider = ({ children }) => {
  const [pendingReferralCount, setPendingReferralCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'))

  const getPendingReferralCount = async () => {
    try {
      const res = await axios.get(
                Api + `/referrals/${user?.id}`
            );

      const waitingList = res?.data?.data?.filter(
        (item) => item.refApprove === "Waiting"
      );

      setPendingReferralCount(waitingList?.length || 0);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPendingReferralCount();
  }, []);

  return (
    <ReferralContext.Provider
      value={{
        pendingReferralCount,
        getPendingReferralCount,
      }}
    >
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferral = () => useContext(ReferralContext);