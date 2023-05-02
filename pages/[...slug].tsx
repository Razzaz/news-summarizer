import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curArticle, setCurArticle] = useState<string>("");

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      !curArticle &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://www.cnbcindonesia.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState]);

  const curUrl = String(curArticle.split(".com")[1]);

  const generateSummary = async (url?: string) => {
    setSummary("");
    if (url) {
      if (!url.includes("cnbcindonesia.com")) {
        toast.error("Please enter a valid CNBC Indonesia article");
        return;
      }
      setCurArticle(url);
    } else {
      if (!curArticle.includes("cnbcindonesia.com")) {
        toast.error("Please enter a valid CNBC Indonesia article");
        return;
      }
      router.replace(curUrl);
    }
    setLoading(true);
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url ? url : curArticle }),
    });

    if (!response.ok) {
      console.log("error", response.statusText);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
      <main className="mx-auto mt-10 flex max-w-5xl flex-1 flex-col justify-center px-2 sm:mt-16">
        <h2 className="max-w-5xl text-center text-2xl font-bold sm:text-4xl">
          Summarize CNBC Indonesia news with AI
        </h2>
        <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl">
          Copy and paste any <span className="text-[#005594]">news </span>
          article link below.
        </p>
        <input
          type="text"
          placeholder="ex: https://www.cnbcindonesia.com/tech/20210901160000-37-273436/whatsapp-bakal-kenalkan-fitur-pesan-hilang"
          value={curArticle}
          onChange={(e) => setCurArticle(e.target.value)}
          className="mx-auto mt-10 w-full rounded-lg border border-gray-500 bg-black p-3 outline-1 outline-white sm:mt-7 sm:w-full"
        />
        {!loading && (
          <button
            className="z-10 mx-auto mt-7 w-full rounded-2xl border-gray-500 bg-[#005594] p-3 text-lg font-medium transition hover:bg-blue sm:mt-10 sm:w-full"
            onClick={() => generateSummary()}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="z-10 mx-auto mt-7 w-full cursor-not-allowed rounded-2xl border-gray-500 bg-[#005594] p-3 text-lg font-medium transition hover:bg-green-400 sm:mt-10 sm:w-1/3"
            disabled
          >
            <div className="flex items-center justify-center text-white">
              <Image
                src="/loading.svg"
                alt="Loading..."
                width={28}
                height={28}
              />
            </div>
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="mb-10 px-4">
            <h2 className="mx-auto mt-16 max-w-3xl border-t border-gray-600 pt-8 text-center text-3xl font-bold sm:text-5xl">
              Summary
            </h2>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7">
              {summary.split(". ").map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <li className="mb-2 list-disc">{sentence}</li>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
