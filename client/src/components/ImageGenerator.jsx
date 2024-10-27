import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import ErrorModal from "./ErrorModal";
import LoadingSpinner from "./LoadingSpinner";
import { debounce, set } from "lodash";

const MAX_CHARS = 200;

const ImageGenerator = ({ addGeneratedImage }) => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHARS);

  useEffect(() => {
    setRemainingChars(MAX_CHARS - prompt.length);
  }, [prompt]);

  const handlePromptChange = (e) => {
    const newPrompt = e.target.value;
    if (newPrompt.length <= MAX_CHARS) {
      setPrompt(newPrompt);
    }
  };

  const clearPrompt = () => {
    setPrompt("");
  };

  const debouncedGenerateImage = debounce(async (prompt) => { 
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL,
        { inputs: prompt },
        {
          timeout: 300000, // 5 minutes
          responseType: "arraybuffer",
        }
      );

      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const newImage = `data:image/png;base64,${base64}`;
      setImage(newImage);
      setPrompt("");
      addGeneratedImage({ id: Date.now(), src: newImage, prompt });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 400) {
            setError("Invalid prompt, please correct and try again.");
          } else if (err.response.status === 500) {
            setError(
              "Our servers are temporarily down. Please try again later."
            );
          }
        } else if (err.request) {
          setError(
            "Network issue. Please check your connection and try again."
          );
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, 300); // Debounce with 300ms delay

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form from reloading
    if (prompt.length > MAX_CHARS) {
      setError(`Prompt must be ${MAX_CHARS} characters or less.`);
      return;
    }

    setLoading(true);
    setError(null);

    // Call the debounced API request
    debouncedGenerateImage(prompt);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="bg-white rounded-full p-4 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
            <span className="text-black font-black text-xl sm:text-2xl">BFL</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
          FLUX.1-schnell
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mb-8 w-full md:w-2/3 mx-auto">
          <div className="mb-4 relative">
            <div className="relative">
              <input
                type="text"
                id="prompt"
                placeholder="Enter your prompt max 200 characters"
                value={prompt}
                maxLength={200}
                onChange={handlePromptChange}
                className="w-full px-3 py-2 bg-white border border-gray-900 font-sans
                rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black pr-20"
                required
              />
              <span className="absolute right-10 top-1/2 transform -translate-y-1/2 text-black text-sm font-sans">
                {remainingChars}
              </span>
              <button
                type="button"
                onClick={clearPrompt}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || prompt.length === 0}
            className="w-full bg-[#008080] text-white py-3 px-4 rounded-md hover:bg-[#00806f] focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-opacity-50 disabled:opacity-50 transition duration-200 text-lg"
          >
            {loading ? "Generating..." : "Generate Image"}
          </button>
        </form>

        {loading && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400 font-sans">Generating image... This may take a few seconds</p>          
            </div>
        )}

        {image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <img
              src={image}
              alt="Generated"
              className="w-full md:w-2/3 rounded-lg shadow-lg"
            />
          </motion.div>
        )}

        {error && <ErrorModal message={error} onClose={() => setError(null)} />}
      </div>
    </div>
  );
};

export default ImageGenerator;
