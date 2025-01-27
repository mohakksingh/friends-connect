const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

router.post('/request/:userId', auth, async (req, res) => {
    try {
        const sender = await User.findById(req.userId);
        const receiver = await User.findById(req.params.userId);

        if (!receiver) {
            return res.status(404).send({ error: "User not found" });
        }

        const existingRequest = await FriendRequest.findOne({
            sender: sender._id,
            receiver: receiver._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).send({ error: "Request already sent" });
        }

        // If no existing request, create a new one
        const friendRequest = new FriendRequest({
            sender: sender._id,
            receiver: receiver._id
        });

        await friendRequest.save();

        sender.sentFriendRequests.push(receiver._id);
        receiver.pendingFriendRequests.push(sender._id);

        await sender.save();
        await receiver.save();

        res.json({
            message: "Friend request sent"
        });
    } catch (e) {
        res.status(500).json({
            error: "Internal server error"
        });
    }
});


router.put("/accept/:requestId",auth,async(req,res)=>{
    try{
        console.log(req.params.requestId)
        const friendRequest = await FriendRequest.findById(req.params.requestId);
        if(!friendRequest){
            return res.status(404).send({error:"Friend request not found"})
        }

        const receiver=await User.findById(req.userId);
        const sender=await User.findById(friendRequest.sender);

        friendRequest.status='accepted';
        await friendRequest.save();

        receiver.friends.push(sender._id);
        sender.friends.push(receiver._id);

        receiver.pendingFriendRequests=receiver.pendingFriendRequests.filter(id => !id.equals(sender._id));
        sender.sentFriendRequests=sender.sentFriendRequests.filter(id=>!id.equals(receiver._id));

        await receiver.save();
        await sender.save();

        res.json({
            message:"Friend request accepted"
        })
    }catch(e){
        res.status(500).json({
            message:"Server error"
        })
    }
})

router.get("/recommendations", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('friends');
        const friendsIds = user.friends.map(friend => friend._id);

        const friendsOfFriends = await User.find({
            _id: {
                $nin: [...friendsIds, user._id, ...user.pendingFriendRequests, ...user.sentFriendRequests]
            }
        }).limit(10);

        const recommendations = await Promise.all(
            friendsOfFriends.map(async (potentialFriend) => {
                const mutualFriends = friendsIds.filter(friendId =>
                    potentialFriend.friends.includes(friendId)
                );

                return {
                    user: {
                        id: potentialFriend._id,
                        username: potentialFriend.username
                    },
                    mutualFriendsCount: mutualFriends.length
                };
            })
        );

        recommendations.sort((a, b) => b.mutualFriendsCount - a.mutualFriendsCount);

        res.json(recommendations);
    } catch (e) {
        console.error("Error:", e); 
        res.status(500).json({
            error: "Internal server error",
            message: e.message
        });
    }
});


module.exports=router;