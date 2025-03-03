import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { GoChevronLeft } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import LogCard from "../components/LogCard";

export default function MarkLeave() {
  const { user } = useContext(UserContext); // Get logged-in user info
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestLog, setLatestLog] = useState(null);
  const [hasLeftRoom, setHasLeftRoom] = useState(false); // Track if user has left
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user || !user.userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `/api/history/get-history?userId=${user.userId}`
        );
        const logData = response.data;
        setLogs(logData);

        // Determine the latest log
        const latest = logData.reduce((latest, log) => {
          if (!latest || new Date(log.entryTime) > new Date(latest.entryTime)) {
            return log;
          }
          return latest;
        }, null);

        setLatestLog(latest);

        // Check if the user has already left the room
        if (latest && latest.exitTime) {
          setHasLeftRoom(true);
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const handleLeaveNow = async () => {
    if (!user || !user.userId) {
      console.error("User not logged in or missing userId");
      return;
    }
  
    if (!latestLog || !latestLog.doorCode) {
      toast.error("No door code available. Please scan a QR code first.");
      return;
    }
  
    const currentTime = new Date().toISOString(); // Current timestamp
    const doorCode = String(latestLog.doorCode); // Ensure doorCode is a string
    const roomName = latestLog.roomName;
  
    try {
      // Step 1: Unlock the door
      const unlockPayload = {
        status: "2", // Ensure status is a string
        DeviceCode: doorCode, // Ensure doorCode is a string
      };
  
      const unlockResponse = await axios.patch(
        "/entrance/apislt/api/user/btnclick",
        unlockPayload,
        { withCredentials: true }
      );
  
      if (unlockResponse.status === 200) {
        console.log(`${roomName} unlocked successfully. User can leave now.`);
        toast.success("You can leave now!");
  
        // Step 1.1: Automatically lock the door after 10 seconds
        setTimeout(async () => {
          try {
            const lockPayload = {
              status: "0", // Locking the door
              DeviceCode: doorCode, // Use the same door code
            };
  
            const lockResponse = await axios.patch(
              "/entrance/apislt/api/user/btnclick",
              lockPayload,
              { withCredentials: true }
            );
  
            if (lockResponse.status === 200) {
              console.log(`${roomName} locked automatically after 10 seconds.`);
              // toast.info(`${roomName} has been locked.`);
            } else {
              console.error("Failed to lock the door automatically.");
              // toast.error("Failed to lock the door automatically.");
            }
          } catch (error) {
            console.error("Error locking the door automatically:", error);
            // toast.error("An error occurred while locking the door.");
          }
        }, 10000); // 10-second delay
      } else {
        toast.error("Failed to unlock the door.");
        return;
      }
  
      // Step 2: Update exit time in history
      const exitPayload = {
        userId: String(user.userId), // Ensure userId is a string
        exitTime: currentTime,
      };
  
      const exitResponse = await axios.post("/api/history/update-exit-time", exitPayload);
  
      if (exitResponse.data.success) {
        toast.success("Exit time updated successfully!");
        navigate("/"); // Redirect to home page
  
        // Step 2.1: Manually update the `latestLog` state with the new exit time
        setLatestLog((prevLog) => ({
          ...prevLog,
          exitTime: currentTime, // Use the current time as exit time
        }));
  
        // Step 2.2: Update the logs array
        setLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === exitResponse.data.updatedHistory._id
              ? { ...log, exitTime: currentTime }
              : log
          )
        );
  
        setHasLeftRoom(true); // Mark as left
      } else {
        toast.error("Failed to update exit time.");
      }
    } catch (error) {
      console.error("Error handling leave process:", error);
      toast.error("An error occurred while leaving.");
    }
  };
  

  const calculateDuration = (entryTime) => {
    const entryDate = new Date(entryTime);
    const currentDate = new Date();
    const durationMs = currentDate - entryDate;
    const durationMinutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div>
      {/* Title Section */}
      <div className="title flex items-center space-x-2 mb-8 dark:text-white">
        <Link to="/">
          <GoChevronLeft className="cursor-pointer" />
        </Link>
        <span className="font-semibold">Leave</span>
      </div>

      {/* Logs Section */}
      {loading ? (
        <p className="pl-4 text-m text-black-500 dark:text-white"></p>
      ) : !latestLog ? (
        <div className="flex justify-center items-center py-8">
          <p className="pl-4 text-gray-500">You are not in a Room.</p>
        </div>
      ) : (
        <LogCard
          room="Room"
          roomcode={latestLog.doorCode || "Unknown Code"}
          door={latestLog.roomName || "Unknown Room"}
          branch={latestLog.location || "Unknown Location"}
          entryTime={
            latestLog.entryTime
              ? new Date(latestLog.entryTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          }
          exitTime={
            latestLog.exitTime
              ? new Date(latestLog.exitTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Currently In Room"
          }
          duration={
            latestLog.entryTime ? calculateDuration(latestLog.entryTime) : ""
          }
          date={
            latestLog.entryTime
              ? new Date(latestLog.entryTime).toLocaleDateString("en-IN")
              : ""
          }
        />
      )}

      {/* Button Section */}
      <div className="py-3">
        {hasLeftRoom || (latestLog && latestLog.exitTime) ? (
          <p className="text-center text-gray-500">
            You have already left the room.
          </p>
        ) : (
          latestLog &&
          !latestLog.exitTime && ( // Ensure button only appears when exitTime is null or not present
            <button
              onClick={handleLeaveNow}
              type="button"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300 mb-2"
            >
              Leave Now
            </button>
          )
        )}
      </div>
    </div>
  );
}