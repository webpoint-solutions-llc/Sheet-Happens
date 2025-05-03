import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {
    //? server side env variables  (can be accessed only on server)
  },
  client: {
    //? client side env variables (can be accessed in both client and server)
    NEXT_PUBLIC_BACKEND_URL: z.string().min(1),
  },
  // specify the runtimeEnv manually
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
});

export default env;
