const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

router.post("/request/:userId", auth, async (req, res) => {
  try {
    const sender = await User.findById(req.userId);
    const receiver = await User.findById(req.params.userId);

    if (!receiver) {
      return res.status(404).send({ error: "User not found" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: sender._id,
      receiver: receiver._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).send({ error: "Request already sent" });
    }

    const friendRequest = new FriendRequest({
      sender: sender._id,
      receiver: receiver._id,
    });

    await friendRequest.save();

    sender.sentFriendRequests.push(friendRequest._id);

    receiver.pendingFriendRequests.push(friendRequest._id);

    await sender.save();
    await receiver.save();

    res.json({
      message: "Friend request sent",
    });
  } catch (e) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.put("/accept/:requestId", auth, async (req, res) => {
  try {
    console.log(req.params.requestId);
    const friendRequest = await FriendRequest.findById(req.params.requestId);
    if (!friendRequest) {
      return res.status(404).send({ error: "Friend request not found" });
    }

    const receiver = await User.findById(req.userId);
    const sender = await User.findById(friendRequest.sender);

    friendRequest.status = "accepted";
    await friendRequest.save();

    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);

    receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
      (id) => !id.equals(sender._id)
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (id) => !id.equals(receiver._id)
    );

    await receiver.save();
    await sender.save();

    res.json({
      message: "Friend request accepted",
    });
  } catch (e) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/recommendations", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends");
    const friendsIds = user.friends.map((friend) => friend._id);

    const friendsOfFriends = await User.find({
      _id: {
        $nin: [
          ...friendsIds,
          user._id,
          ...user.pendingFriendRequests,
          ...user.sentFriendRequests,
        ],
      },
    }).limit(10);

    const recommendations = await Promise.all(
      friendsOfFriends.map(async (potentialFriend) => {
        const mutualFriends = friendsIds.filter((friendId) =>
          potentialFriend.friends.includes(friendId)
        );

        return {
          user: {
            id: potentialFriend._id,
            username: potentialFriend.username,
          },
          mutualFriendsCount: mutualFriends.length,
        };
      })
    );

    recommendations.sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount);

    res.json(recommendations);
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({
      error: "Internal server error",
      message: e.message,
    });
  }
});

router.get("/requests", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "pendingFriendRequests",
      match: { status: "pending" },
      populate: {
        path: "sender",
        select: "username email",
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.pendingFriendRequests);
  } catch (e) {
    console.error("Error fetching friend requests:", e);
    res.status(500).json({
      error: "Internal server error",
      message: e.message,
    });
  }
});

router.put("/:action/:requestId", auth, async (req, res) => {
  const { action, requestId } = req.params;
  const userId = req.userId;

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    const { sender: senderId, receiver: receiverId } = friendRequest;

    if (receiverId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to respond to this request" });
    }

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ error: "User not found" });
    }

    if (action === "accept") {
      if (receiver.friends.includes(senderId)) {
        return res
          .status(400)
          .json({ error: "You are already friends with this user" });
      }

      receiver.friends.push(senderId);
      sender.friends.push(receiverId);

      friendRequest.status = "accepted";

      receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
        (id) => !id.equals(friendRequest._id) 
      );
      sender.sentFriendRequests = sender.sentFriendRequests.filter(
        (id) => !id.equals(friendRequest._id)
      );

      await friendRequest.save();
      await receiver.save();
      await sender.save();

      console.log("Updated Receiver:", receiver);
      console.log("Updated Sender:", sender);

      return res.json({ message: "Friend request accepted" });
    } else if (action === "reject") {
      friendRequest.status = "rejected";

      receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
        (id) => !id.equals(friendRequest._id)
      );
      sender.sentFriendRequests = sender.sentFriendRequests.filter(
        (id) => !id.equals(friendRequest._id)
      );

      await friendRequest.save();
      await receiver.save();
      await sender.save();

      console.log("Updated Receiver:", receiver);
      console.log("Updated Sender:", sender);

      return res.json({ message: "Friend request rejected" });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Error handling friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/myfriends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "friends",
      select: "username email"
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.friends);
  } catch (error) {
    console.error("Error fetching friend list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
