"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { MyRenderer } from "./MyRenderer";
import { Renderer3D } from "./Renderer3D";
import { useRef, useState, useEffect } from "react";
import Viewport from "@/core/Viewport";
import { ViewportMode } from "@/core/Viewport";

export default function Home() {
  const rendererRef = useRef<Renderer3D>(new Renderer3D());
  const [invalidateSignal, setInvalidateSignal] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        setInvalidateSignal((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>To get started, edit the page.tsx file.</h1>
          <Viewport renderer={rendererRef.current} invalidateSignal={invalidateSignal} mode={ViewportMode.Continuous} />
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
