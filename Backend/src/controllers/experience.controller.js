import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Experience } from "../models/experience.model.js"

export const addExperience = asyncHandler ( async (req, res) => {
    const {
        title, description, latitude, longitude, category, tags
    } = req.body
    const tagArr = tags.split(",").map((item) => item.trim())

    // console.log(req, "files");

    if (
        [title, description].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields required")
    }

    const imageArr = req.files
    const urlArr = []
    if (imageArr.length > 0) {
        for (let i=0; i<imageArr.length; i++) {
            const cloudinaryUrl = await uploadOnCloudinary(imageArr[i].path);
            urlArr.push(cloudinaryUrl.url)
        }
        // console.log(urlArr);
        if (urlArr.length <= 0) {
            throw new ApiError(400, "Something went wrong while uploading images")
        }
    }

    const experience = await Experience.create({
        title,
        description,
        images: urlArr,
        tags: tagArr,
        category,
        location: {
            type: "Point",
            coordinates: [latitude, longitude]
        }
    })

    return res
    .status(200)
    .json(new ApiResponse(200, experience, "experience created successfully"))
})