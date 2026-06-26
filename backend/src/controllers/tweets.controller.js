import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Empty Feild");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created succesfully!!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User id");
  }
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId), //. ye toh mtlb tweets wale collectioon mein hi h
      },
    },
    {
      $lookup: {
        // mein uss user ki info leke aa raha h jiska tweet h
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userinfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        userinfo: {
          $first: "$userinfo",
        },
      },
    },
  ]);
  //   console.log(tweets);

  res.status(200).json(new ApiResponse(200, tweets, "All tweets data"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet Not found");
  }

  if (tweet.owner.toString() !== req.user?._id?.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const tweetinfo = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  //
  //   const tweet = await Tweet.findOneAndUpdate(
  //     {
  //         _id: tweetId,
  //         owner: req.user._id
  //     },
  //     {
  //         $set: { content }
  //     },
  //     { new: true }
  // );

  // if (!tweet) {
  //     throw new ApiError(404, "Tweet not found or unauthorized");
  // }
  res.status(200).json(new ApiResponse(200, tweetinfo, "Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet");
  }
  const de = await Tweet.findOneAndDelete({
    _id:tweetId,
    owner : req.user._id
  });
  console.log(de);
  
  if (!de) {
    throw new ApiError(404, "Tweet not found or unauthorized access");
  }
  res.status(200).json(new ApiResponse(200,{},"Deleted Successfully"));

});
export { createTweet, getUserTweets, updateTweet, deleteTweet };
