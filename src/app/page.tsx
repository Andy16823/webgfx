"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Viewport from "@/Viewport";
import { WebGFX } from "@/core/WebGFX";
import { defaultShader } from "./shader/Shaders";
import PipelineBuilder from "@/core/PipelineBuilder";

import { OrthographicCamera } from "@/core/Camera";
import { MyRenderer } from "./MyRenderer";
import Transform from "@/core/Transform";
import { useRef } from "react";

export default function Home() {
  const rendererRef = useRef<MyRenderer>(new MyRenderer());



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
          <Viewport renderer={rendererRef.current} fpsTarget={40} />
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
