import React from 'react';

const ApprovedPermissionCard = ({ permission }) => {
  const {roomName, location, door, inTime, outTime, date, message } = permission;

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-white">{door.roomName}</h2>
        <span className=" dark:text-white font-bold">{door ? door.doorCode : "N/A"}</span>
      </div>
      <div className="space-y-2 text-gray-600 dark:text-slate-200">
        <div className="flex justify-between">
          <span>Room</span>
          <span className=" text-gray-800 dark:text-slate-200">{roomName}</span>
        </div>
        <div className="flex justify-between">
          <span>Location</span>
          <span className=" text-gray-800 dark:text-slate-200">{location}</span>
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
        <div >
          <span className="block text-sm font-medium text-gray-600 dark:text-slate-200 mb-2">Message</span>
          <span 
  className="block mt-2 font-mono bg-gray-200 dark:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-200  px-2 py-1"
>
  {message}
</span>
        </div>
      </div>
    </div>
  );
};

export default ApprovedPermissionCard;