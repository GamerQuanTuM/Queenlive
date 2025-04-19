"use client";
import * as React from "react";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSocket } from "@/providers/socket";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

type Product = {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  product: Product;
  role: string;
  onAction: () => void;
};

export default function ProductCard({ product, role, onAction }: Props) {
  const { socket, isConnected } = useSocket();

  const handleOrder = () => {
    if (role !== "merchant" && socket && isConnected) {
      socket.emit("new-order-broadcast", {
        items: [
          {
            productId: product.id,
            quantity: 1,
          },
        ],
        status: "PENDING",
      });
    } else {
      onAction();
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/product/${product.id}`);
      onAction();
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg border border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {product?.name}
          </CardTitle>
          <Button onClick={handleDelete} className="bg-red-200 hover:bg-red-300 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
            <Trash size={15} color="red" />
          </Button>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          {product?.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-700 dark:text-gray-200">
          <span className="font-medium">Quantity:</span> {product?.quantity}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          <span className="font-medium">Price:</span> $
          {product?.price.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Created:</span>{" "}
          {new Date(product?.updatedAt).toDateString()}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full cursor-pointer" onClick={handleOrder}>
          {role === "merchant" ? "Edit" : "Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}
