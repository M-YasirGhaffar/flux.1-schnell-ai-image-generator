const axios = require("axios");
const config = require("../config/config");

const queryHuggingFace = async (data) => {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      data,
      {
        headers: {
          Authorization: `Bearer ${config.huggingFaceApiKey}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        responseType: "arraybuffer", // To handle binary data like an image
        timeout: 5 * 60 * 1000, // 5 minutes timeout
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error querying Hugging Face API:", error.response?.data || error.message);
    throw new Error("Hugging Face API failed or timed out");
  }
};

module.exports = { queryHuggingFace };