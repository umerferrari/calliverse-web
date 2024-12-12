const fs = require("fs");

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      console.log(`File deleted: ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }

    return { success: true };

  } catch (error) {
    throw new CustomError('Error in profile Image deletion', 500);
  }
};

module.exports = deleteFile;
