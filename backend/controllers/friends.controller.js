const parser = require("papaparse");
const User = require("../model/User.model");

exports.getOthers = async (req, res) => {
  try {
    // get the user ID
    const { _id: userId } = req.user;

    // find the user
    const user = await User.findById(userId);

    // if there is no user
    if (!user) {
      return res.status(401).json({
        message: "User does not exist",
        data: null,
      });
    }

    // get the user friends
    const { friends } = user;

    // find all users except the current user
    const otherUsers = await User.find({
      _id: { $ne: userId }, // $ne means "not equal"
    });

    // get potential friends
    const potentialFriends = otherUsers.filter((otherUser) => {
      for (const friendId of friends) {
        if (otherUser._id.equals(friendId)) {
          return false; // Friend found, exclude user from potentialFriends
        }
      }
      return true; // Friend not found, include user in potentialFriends
    });

    res.status(200).json({
      message: "Potential Friends",
      data: potentialFriends,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

exports.addFriend = async (req, res) => {
  try {
    // get user id
    const { _id } = req.user;

    // get the new friend ID from request body
    const { id: newfriendId } = req.body;

    // get friends of the user
    const { friends } = await User.findById(_id);

    // check if the new friend is already a friend
    for (const friend of friends) {
      if (friend._id.equals(newfriendId)) {
        return res
          .status(400)
          .json({ message: "This user is already friends with you!" });
      }
    }

    // update the user's friends
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          friends: newfriendId,
        },
      },
      { new: true, useFindAndModify: false },
    ).populate("friends");

    res.status(200).json({
      message: "Friend added successfully!",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

exports.getFriendsCsvData = async (req, res) => {
  try {
    // extract the user's ID from the request object
    const { _id } = req.user;

    // find the user by ID and populate the 'friends' field
    const user = await User.findById(_id).populate("friends");

    // destructure the 'friends' field from the user object
    const { friends } = user;

    // map over the friends array and format the data for CSV
    const formattedData = friends.map((friend) => ({
      Name: friend.username,
      Gender: friend.gender,
      Location: friend.currentLocation.name,
      friends: friend.friends.length,
      visited: friend.locations
        .map((location, index) => `${index + 1}. ${location.name}`)
        .join("\n"),
    }));

    // convert the formatted data to CSV using the 'unparse' method from the 'papaparse' library
    const csv = parser.unparse(formattedData, {
      header: true,
    });

    // set the response headers to indicate that the content is CSV
    res.header("Content-Type", "text/csv");

    // send the CSV data in the response with a status code of 200 (OK)
    res.status(200).send(csv);
  } catch (error) {
    // handle errors by sending a JSON response with an error message and status code 500 (Internal Server Error)
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};