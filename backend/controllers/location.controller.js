const parser = require("papaparse");
const User = require("../model/User.model");

exports.addLocation = async (req, res) => {
  try {
    // extract location details from the request body
    const { name, latitude, longitude } = req.body;
    // extract the user's ID
    const { _id } = req.user;

    // update the user with new location details
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          locations: {
            name,
            latitude,
            longitude,
          },
        },
        $set: {
          currentLocation: {
            name,
            latitude,
            longitude,
          },
        },
      },
      { new: true, useFindAndModify: false },
    );

    // if user is not found
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

    res.status(200).json({
      message: "Location added successfully!",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

exports.editLocation = async (req, res) => {
  try {
    // extract the user's ID
    const { _id } = req.user;
    // extract the location details from the request body
    const { id: locationId, name: newLocationName } = req.body;

    // update the user with new location details
    const updatedUser = await User.findOneAndUpdate(
      { _id, "locations._id": locationId },
      {
        $set: {
          "locations.$.name": newLocationName,
        },
      },
      { new: true },
    );

    // if the location is not found
    if (!updatedUser) {
      return res.status(404).json({
        message: "Location not found",
        data: null,
      });
    }

    res.status(200).json({
      message: "Location updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    // extract the user's ID
    const { _id } = req.user;
    // extract location details from the request body
    const { id: locationId } = req.body;

    // update the user with new location details
    const location = await User.findOneAndUpdate(
      { _id, "locations._id": locationId },
      {
        $pull: {
          locations: { _id: locationId },
        },
      },
      { new: true },
    );

    // if the location is not found
    if (!location) {
      return res.status(404).json({
        message: "Location not found",
        data: null,
      });
    }

    res.status(200).json({
      message: "Location deleted successfully!",
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { params } = req;
    const { username } = params;

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
        data: null,
      });
    }

    res.status(200).json({
      message: "User found!",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};

exports.getLocationCsvData = async (req, res) => {
  try {
    // retrieve the user and locations:
    const { _id } = req.user;
    const user = await User.findById(_id);
    const { locations } = user;

    // format the location data for CSV:
    const formattedData = locations.map((location) => ({
      Name: location.name,
      Latitude: location.latitude,
      Longitude: location.longitude,
    }));

    // generate the CSV string
    const csv = parser.unparse(formattedData, {
      header: true,
    });

    // set the response headers and send CSV:
    res.header("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
    });
  }
};