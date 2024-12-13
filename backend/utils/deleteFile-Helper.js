// const fs = require("fs");
// const CustomError = require("./customError");

// const deleteFile = (filePath) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);

//       console.log(`File deleted: ${filePath}`);
//     return true;

//     } else {
//     return false;
      
//     }


//   } catch (error) {
//     throw new CustomError('Error in file deletion', 500);
//   }
// };

// module.exports = deleteFile;

const fs = require("fs");
const path = require("path");
const CustomError = require("./customError");


const deleteFile = (filePath) => {
  try {
    if (!filePath || typeof filePath !== "string") {
      throw new CustomError("Invalid file path provided", 400);
    }

    // Resolve the base directory for the `uploads` folder
    const baseDir = path.join(__dirname, "../uploads");
    const resolvedPath = path.join(baseDir, filePath.replace("/uploads", ""));

    console.log("Incoming path:", filePath);
    console.log("Resolved path:", resolvedPath);

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      console.log(`File deleted successfully: ${resolvedPath}`);
      return { success: true, message: "File deleted successfully" };
    } else {
      console.error(`File not found: ${resolvedPath}`);
      return { success: false, message: "File not found" };
    }
  } catch (error) {
    console.error(`Error during file deletion: ${error.message}`);
    throw new CustomError(error.message || "Error in file deletion", 500);
  }
};


module.exports = deleteFile;
