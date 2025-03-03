import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const DeniedPermissionCard = ({ permission }) => {
  const { roomName,location, door, inTime, outTime, date } = permission;

  return (
    <div className="max-w-sm p-4 bg-slate-100 dark:bg-slate-700  rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibol dark:text-white">{door.roomName}</h2>
        <span className="font-bold dark:text-white">{door ? door.doorCode : "N/A"}</span>
      </div>
      <div className="space-y-2 text-gray-600 dark:text-slate-200">
        <div className="flex justify-between">
          <span>Room</span>
          <span className="text-blue-500">{roomName }</span>
        </div>
        <div className="flex justify-between">
          <span>Location</span>
          <span className="text-blue-500">{location}</span>
        </div>
        <div className="flex justify-between">
          <span>In Time</span>
          <span className="font-medium text-gray-800 dark:text-slate-200">{inTime}</span>
        </div>
        <div className="flex justify-between">
          <span>Out Time</span>
          <span className="font-medium text-gray-800 dark:text-slate-200">{outTime}</span>
        </div>
        <div className="flex justify-between">
          <span>Date</span>
          <span className="font-medium text-gray-800 dark:text-slate-200">{new Date(date).toLocaleDateString()}</span>
        </div>
        </div>
      <div className="flex items-center space-x-3 mt-4">
        <FaUserCircle className="text-purple-600 text-2xl" />
        <div className="ml-auto">
          <span className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
            Denied
          </span>
        </div>
      </div>
      <div className="block mt-2 font-sans bg-gray-200 dark:bg-slate-600 rounded-lg text-red-5S00 dark:text-red-200 px-2 py-1  ">
        Sorry, your request for access has been denied by the admin. This access is currently restricted for you. Try with a different time slot.
      </div>
    </div>
  );
};

export default DeniedPermissionCard;