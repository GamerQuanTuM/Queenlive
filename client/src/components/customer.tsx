"use client";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import ProductCard from "./product-card";
import LoadingSkeleton from "./loading-skeleton";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const Customer = ({ role }: { role: string }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await axiosInstance.get("/product");
        setProducts(data);
        setError(null);
        setIsLoading(false);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
        setError(error);
      } finally {
        setIsLoading(false);
        setError(null);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoading) {
      <LoadingSkeleton />;
    }
  }, [products]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome, Customer 👋</h1>
      <p className="text-gray-600 mt-2">Here are some product for you:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {products?.map((product, index) => (
          <ProductCard
            role={role}
            product={product}
            key={index}
            onAction={() => {}}
          />
        ))}
      </div>

      <Button
        className="w-full cursor-pointer"
        onClick={() => router.push("/chat")}
      >
        {role === "customer" && "Chat with our merchants"}
      </Button>
    </div>
  );
};

export default Customer;
