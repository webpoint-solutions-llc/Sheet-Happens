"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import LogoComponent from "../../../../public/logo";

const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .refine((email) => email.endsWith("@webpoint.io"), {
      message: "Email must be a webpoint.io address",
    }),
  password: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const LoginComponent = () => {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function login(values: FormValues) {
    try {
      const response = await fetch("http://10.10.1.211:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        // Handle the error if the response is not OK
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      localStorage.setItem("token", data.payload.name); // Store token in local storage
      router.push("/dashboard"); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      // Optionally display error messages to the user
    }
  }

  function onSubmit(values: FormValues) {
    console.log(values);
    login(values);
  }

  return (
    <>
      <div className="flex items-center justify-center my-20">
        <div className="flex flex-col max-w-md w-full bg-white  rounded-lg p-8">
          <div className="flex items-center justify-center py-3">
            <LogoComponent />
          </div>
          <div className="text-3xl font-semibold py-3">
            Log in to your account
          </div>
          <div className="flex items-center justify-center flex-col w-full gap-3 mb-6">
            <p className="text-gray-500">
              Welcome back! Please enter your details
            </p>
          </div>

          <div className="w-full">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-500 py-4"
                    >
                      Remember for 30 days
                    </label>
                  </div>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Sign in
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginComponent;
