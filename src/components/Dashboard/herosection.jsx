import React, { useEffect, useState } from "react";

export default function HeroSection() {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [startLine1, setStartLine1] = useState(false);
  const [startLine2, setStartLine2] = useState(false);

  const fullLine1 = "Listen to Anything";
  const fullLine2 = "Anywhere";

  useEffect(() => {
    const delayBeforeTyping = setTimeout(() => setStartLine1(true), 500);
    return () => clearTimeout(delayBeforeTyping);
  }, []);

  useEffect(() => {
    if (startLine1) {
      let i = 0;
      const typing1 = setInterval(() => {
        if (i < fullLine1.length) {
          setLine1(fullLine1.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typing1);
          setTimeout(() => setStartLine2(true), 500);
        }
      }, 70);
    }
  }, [startLine1]);

  useEffect(() => {
    if (startLine2) {
      let i = 0;
      const typing2 = setInterval(() => {
        if (i < fullLine2.length) {
          setLine2(fullLine2.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typing2);
        }
      }, 70);
    }
  }, [startLine2]);

  return (
    <section className="relative flex flex-col md:flex-row items-center justify-center md:justify-around px-8 md:px-20 py-20 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-sky-500 min-h-screen">
      {/* Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) scale(0.96); }
          50% { transform: translateY(-14px) scale(1); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>

      {/* LEFT TEXT SECTION */}
      <div className="flex-1 max-w-lg space-y-6 md:mr-10">
        <div className="h-[140px] md:h-[160px] flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-semibold text-sky-800 leading-tight whitespace-nowrap">
            <span className="block">
              {line1}
              {startLine1 && line1 !== fullLine1 && (
                <span
                  className="inline-block bg-sky-800 animate-[blink_1s_infinite]"
                  style={{
                    width: "2px",
                    height: "1.1em",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </span>
            <span className="block">
              {line2}
              {startLine2 && line2 !== fullLine2 && (
                <span
                  className="inline-block bg-sky-800 animate-[blink_1s_infinite]"
                  style={{
                    width: "2px",
                    height: "1.1em",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </span>
          </h1>
        </div>

        <p className="text-sky-700/80 text-base md:text-lg leading-relaxed mt-4 max-w-md">
          Experience audio like never before. Stream, listen, and enjoy your
          favorite content from anywhere in the world.
        </p>

        <div className="flex gap-4 pt-6">
          <button className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-6 py-3 rounded-xl shadow-md transition">
            Explore More
          </button>
          <button className="border border-sky-300 hover:bg-sky-50 text-sky-700 font-medium px-6 py-3 rounded-xl transition">
            Learn More
          </button>
        </div>
      </div>

      {/* RIGHT IMAGE SECTION */}
      <div className="flex-1 grid grid-cols-2 gap-x-24 gap-y-16 justify-center items-center mt-12 md:mt-0 relative">
        {/* Top Left */}
        <div className="w-[240px] h-[270px] md:w-[270px] md:h-[310px] rounded-3xl overflow-hidden shadow-xl bg-sky-100 animate-[float1_5s_ease-in-out_infinite]">
          <img
            src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/Cel3.jpg"
            alt="Student 1"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Top Right */}
        <div className="w-[230px] h-[270px] md:w-[260px] md:h-[310px] rounded-3xl overflow-hidden shadow-xl bg-sky-200 mt-20 animate-[float2_6s_ease-in-out_infinite]">
          <img
            src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/Cel2.jpg"
            alt="Student 2"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Bottom Center */}
        <div className="absolute bottom-[-20px] left-[37%] -translate-x-[50%] w-[170px] h-[170px] md:w-[190px] md:h-[190px] rounded-3xl overflow-hidden shadow-2xl bg-sky-300 animate-[float3_6s_ease-in-out_infinite] z-10 opacity-95 backdrop-blur-sm">
          <img
            src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/allAthenaAssets/Cel1.jpg"
            alt="Student 3"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
