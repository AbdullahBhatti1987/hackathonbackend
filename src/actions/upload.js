export async function uploadImage(categoryForm) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apikey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_KEY;
  const timestamps = Math.round(new Date().getTime() / 1000);
  const signature = generateSignature(timestamps, apiSecret);

  const formData = new FormData();
  formData.append("file", categoryForm.get('image'));

  formData.append("api_key", apikey);
  formData.append("timestamp", timestamps);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (response.ok) {
    console.log("data=>", data.secure_url);
    return data.secure_url;
  } else {
    console.log("error=>", data.error.message);
    return data.error.message;
  }
}

function generateSignature(timestamp, apiSecret) {
  const crypto = require("crypto");
  const signature = crypto.createHash("sha1").update(`timestamp=${timestamp}${apiSecret}`).digest("hex");
  return signature;
}
