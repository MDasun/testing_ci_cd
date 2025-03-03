import React, { useContext, useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import avatar from "../assets/avatar.png";
import askpermission from "../assets/DashbordIcons/askpermission.png";
import contact from "../assets/DashbordIcons/contactus.png";
import goin from "../assets/DashbordIcons/go-in.png";
import leave from "../assets/DashbordIcons/leave.png";
import logbook from "../assets/DashbordIcons/logbook.png";
import permissions from "../assets/DashbordIcons/permissions.png";
import settings from "../assets/DashbordIcons/settings.png";
import DashboardTab from "../components/DashboardTab";
import axios from "axios";

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Room and time tracking states
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]);
  const [roomLoading, setRoomLoading] = useState(true);
  
  // Notification states
  const [notificationCount, setNotificationCount] = useState(0);
  const [permissionCount, setPermissionCount] = useState({ approved: 0, rejected: 0 });
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  // Separate error states
  const [roomError, setRoomError] = useState(null);
  const [notificationError, setNotificationError] = useState(null);

  // Fetch notifications and permissions
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) {
        setNotificationLoading(false);
        return;
      }

      try {
        setNotificationLoading(true);
        const token = localStorage.getItem("token");

        // Fetch permissions
        const permissionResponse = await axios.get("/api/permission/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (permissionResponse.status === 200) {
          const approvedCount = permissionResponse.data.filter(p => p.status === "Approved").length;
          const rejectedCount = permissionResponse.data.filter(p => p.status === "Rejected").length;
          setPermissionCount({ approved: approvedCount, rejected: rejectedCount });
        }

        // Fetch notifications
        const logResponse = await axios.get(`/api/contactus/user/${user._id}`);
        const logData = logResponse.data;
        const filteredNotificationCount = logData.filter(
          (log) => log.user.objId.toString() === user._id && 
                   log.reply !== null && 
                   log.userstatus === "unread"
        );
        setNotificationCount(filteredNotificationCount.length);
        setIsDataFetched(true);
      } catch (err) {
        setNotificationError("Failed to fetch notifications");
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchNotifications();
  }, [user?._id]);

  // Fetch room logs separately
  useEffect(() => {
    if (!user?.userId) {
      setRoomLoading(false);
      return;
    }

    const fetchRoomLogs = async () => {
      try {
        const response = await axios.get(`/api/history/get-history?userId=${user.userId}`);
        const logData = response.data;
        logsRef.current = logData;
        setLogs(logData);
      } catch (error) {
        setRoomError("Failed to fetch room history");
      } finally {
        setRoomLoading(false);
      }
    };

    if (logsRef.current.length === 0) {
      fetchRoomLogs();
    } else {
      setLogs(logsRef.current);
    }
  }, [user?.userId]);

  const latestLog = logs.reduce((latest, log) => {
    if (!latest || new Date(log.entryTime) > new Date(latest.entryTime)) {
      return log;
    }
    return latest;
  }, null);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-500 dark:text-slate-400">Hello,</p>
            {!!user && (
              <h1 className="text-2xl font-semibold dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => navigate("/notification")} 
                className="text-yellow-400 text-3xl mt-1"
              >
                <FaBell />
                { (
                  <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                    {notificationCount + permissionCount.approved + permissionCount.rejected}
                  </span>
                )}
              </button>
            </div>
            <img
              src={user?.profilePicture || avatar}
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover cursor-pointer"
              onClick={() => navigate("/profile")}
              onError={(e) => (e.target.src = avatar)}
            />
          </div>
        </div>
        {/* Show message if face registration is not complete (user.faceCount = 0) */}
        {user?.faceCount === 0 && (
          <div className="bg-red-200 text-red-700 p-4 mb-6 rounded-lg">
            Face Registration not complete. Please complete the registration process.{" "}
            <button
              onClick={() => navigate("/face-registration")}
              className="text-blue-500 hover:text-blue-700"
            >
              Click here
            </button>
          </div>
        )}
        {/* Room Information */}
        {roomLoading ? (
          <p className="text-center text-gray-500"></p>
        ) : roomError ? (
          <p className="text-center text-red-500">{roomError}</p>
        ) : latestLog ? (
          <div>
            <p className="text-gray-600 dark:text-slate-300 mb-2">Dashboard</p>
            <div className="bg-slate-700 dark:bg-slate-900 text-white rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {new Date().toLocaleDateString("en-US", { 
                    weekday: "long", 
                    day: "numeric", 
                    month: "long" 
                  })}
                </span>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <p className="mt-2">Room: {latestLog.roomName || "Unknown Room"}</p>
              <p>
                Last In Time:&nbsp;
                {latestLog.entryTime
                  ? new Date(latestLog.entryTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <p>
                Last Left Time:&nbsp;
                {latestLog.exitTime
                  ? new Date(latestLog.exitTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Currently In Room"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500"></p>
        )}

        {/* Dashboard Tabs */}
        <div className="space-y-4">
          <DashboardTab title="Go In" description="Scan the QR and Face" href="/entrancepage" image={goin} />
          <DashboardTab title="Leave" description="Mark the Leave" href="/markleave" image={leave} />
          <DashboardTab title="Ask Permission" description="Ask permission for Access room" href="/askpermission" image={askpermission} />
          <DashboardTab title="My Permissions" description="Permissions I submitted" href="/mypermissions" image={permissions} />
          <DashboardTab title="Log Book" description="Accessed doors logs" href="/mylogbook" image={logbook} />
          <DashboardTab title="Settings" description="Account and App settings" href="/settings" image={settings} />
          <DashboardTab title="Contact Us" description="Contact us for Emergency" href="/contactus" image={contact} />
        </div>
      </div>
    </div>
  );
};

export default Home;