const ContactUs = require('../models/contactUs');
const User = require("../models/user");

const postContactUs = async (req, res) => {
  const { message, user } = req.body;

  try {
    // Fetch the user object from the database
    const userData = await User.findById(user.objId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newMessage = new ContactUs({
      message,
      user: {
        objId: user.objId,
        userId: user.userId, 
      },
      company: userData.company, // Include the company ID from the user object
    });

    await newMessage.save();
    return res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error sending message.' });
  }
};

const getContactUsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate objId
    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "Invalid or missing user objId." });
    }

    // Query the database with objId
    const contactUsData = await ContactUs.find({ "user.objId": userId });

    // If no data is found, return 404
    if (!contactUsData || contactUsData.length === 0) {
      return res.status(404).json({ message: "No contact data found for this user." });
    }

    res.status(200).json(contactUsData);
  } catch (error) {
    console.error("Error fetching contact us data:", error);
    res.status(500).json({ message: "Server error while fetching data." });
  }
};

const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedNotification = await ContactUs.findByIdAndUpdate(
      id,
      { userstatus: 'read' },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, message: 'Notification status updated.', data: updatedNotification });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error updating notification status.' });
  }
};

module.exports = {
  postContactUs, 
  getContactUsByUser,
  updateNotificationStatus,
};