import {asyncHandler} from "../utils/asyncHandlerHelper.js"

const registerUser = asyncHandler(async (req ,resp)=>{
  resp.status(200).json({
    message : "ok"
  })
})

export {registerUser}