import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { GoChevronLeft } from "react-icons/go";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";

export default function Notification() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch permissions and notifications independently
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch permissions
        const permResponse = await axios.get("/api/permission/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const permissionsData = permResponse.status === 200 ? permResponse.data
          .filter(item => item.status !== "Pending")
          .map(item => ({
            ...item,
            type: "permission"
          })) : [];

        setPermissions(permissionsData);

        // Fetch notifications (only if user ID exists)
        if (user?._id) {
          try {
            const logResponse = await axios.get(`/api/contactus/user/${user._id}`);
            const logData = logResponse.data.filter(
              (log) => log.user.objId.toString() === user._id && log.reply !== null
            ).map(item => ({
              ...item,
              type: "notification"
            }));

            setNotifications(logData);
          } catch (err) {
            //console.error("Error fetching notifications:", err);
            // Notifications fetch failed, but we don't set an error state
            // because permissions should still be displayed
          }
        }
      } catch (err) {
        //console.error("Error fetching permissions:", err);
        setError("Failed to fetch permissions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Combine and sort by 'updatedAt'
  const combinedData = [...notifications, ...permissions]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleNotificationClick = async (id) => {
    try {
      await axios.put(`/api/contactus/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, userstatus: "read" } : item))
      );
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  return (
    <div>
      <div className="title flex items-center space-x-2 mb-8 dark:text-white">
        <Link to="/">
          <GoChevronLeft className="cursor-pointer" />
        </Link>
        <span className="font-semibold">My Notifications</span>
      </div>

      {loading ? (
        <div>
          <p></p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {combinedData.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500">No notifications available.</p>
            </div>
          ) : (
            combinedData.map((item, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg shadow-md space-y-4 transition-all duration-300 
                  ${item.type === "permission" ? 
                    (item.status === "Approved" ? "bg-green-50 dark:bg-slate-700 border-l-4 border-green-500" : 
                      item.status === "Rejected" ? "bg-red-50 dark:bg-slate-700 border-l-4 border-red-500" : "bg-gray-100 dark:bg-slate-700") : 
                    (item.userstatus === "unread" ? "bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500" : "bg-gray-100 dark:bg-slate-700")}`}
                // onClick={() => item.type === "notification" && handleNotificationClick(item._id)}
              >
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {item.type === "permission" ? "Permission Request" : "Admin Response"}
                </h2>

                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-md">
                  {item.type === "permission" ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      Your request for {item.roomName} access is  
                    </span> 
                    <span className="font-semibold"> {item.status}.</span>                  </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 pb-6">
                      <span className="font-medium">Message:</span> {item.message}
                    </p>
                  )}

                  {item.type === "notification" && (
                    <div className="bg-blue-100 dark:bg-slate-500 p-4 rounded-md">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-medium">Reply:</span> {item.reply}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-right text-gray-500 dark:text-gray-400">
                  {new Date(item.updatedAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour12: true,
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
