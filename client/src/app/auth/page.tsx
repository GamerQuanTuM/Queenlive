"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role, useAuth } from "@/providers/auth";

export default function Auth() {
  const { login, register, loading, error } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<Role>(Role.CUSTOMER);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const res = await register(
      data.email,
      data.password,
      data.name,
      selectedRole
    );

    if (!res) {
      toast.error("Register failed");
    } else {
      toast.success("Register success");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    const res = await login(data.email, data.password);

    if (!res) {
      toast.error("Login failed");
    } else {
      toast.success("Login success");
      router.push("/");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Tabs defaultValue="login" className="w-full lg:w-1/2 mx-3 lg:mx-0">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl">Register</CardTitle>
              <CardDescription className="text-center">
                Sign Up to access the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter Your Name"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="Enter Your Email"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter Your Password"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="usertype">Role</Label>
                    <Select
                      onValueChange={(value) => setSelectedRole(value as Role)}
                    >
                      <SelectTrigger id="usertype" className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value={Role.CUSTOMER}>
                          {Role.CUSTOMER}
                        </SelectItem>
                        <SelectItem value={Role.MERCHANT}>
                          {Role.MERCHANT}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardFooter className="flex justify-center pt-6">
                  <Button
                    className={loading ? "bg-gray-400" : "bg-black"}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? "Loading..." : "Register"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl">Login</CardTitle>
              <CardDescription className="text-center">
                Login to access the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email" // Add this
                      placeholder="Enter Your Email"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter Your Password"
                    />
                  </div>
                </div>
                <CardFooter className="flex justify-center pt-6">
                  <Button
                    className={loading ? "bg-gray-400" : "bg-black"}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? "Loading..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
