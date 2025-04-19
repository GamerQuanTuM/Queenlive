"use client";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import ProductCard from "./product-card";
import LoadingSkeleton from "./loading-skeleton";
import { Button } from "./ui/button";
import ProductDialog from "./product-dialog";
import { useSocket } from "@/providers/socket";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

const Merchant = ({ role }: { role: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  const [refetchProducts, setRefetchProducts] = useState(false);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleOrderBroadcast = (data: any) => {
      toast.success(data);
    };

    socket.on("new-order-broadcast", handleOrderBroadcast);

    return () => {
      socket.off("new-order-broadcast", handleOrderBroadcast);
    };
  }, [socket, isConnected]);

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
  }, [refetchProducts]);

  useEffect(() => {
    if (isLoading) {
      <LoadingSkeleton />;
    }
  }, [products]);

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, Merchant 🛒
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your product listings below:
            </p>
          </div>
          <Button onClick={() => setIsOpenAdd(true)}>Add Product</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {products?.map((product, index) => {
            return (
              <div key={index}>
                <ProductCard
                  product={product}
                  role={role}
                  onAction={() => {
                    setRefetchProducts(!refetchProducts);
                    setEditProductId(product.id);
                  }}
                />
                {editProductId === product.id && (
                  <ProductDialog
                    isEdit
                    product={product}
                    isOpen={editProductId === product.id}
                    onClose={() => setEditProductId(null)}
                    onSuccess={() => setRefetchProducts(!refetchProducts)}
                  />
                )}
              </div>
            );
          })}
        </div>
        <Button
          className="w-full cursor-pointer"
          onClick={() => router.push("/chat")}
        >
          {role === "merchant" && "Customer Chats"}
        </Button>
      </div>

      {isOpenAdd && (
        <ProductDialog 
          isOpen={isOpenAdd} 
          onClose={() => setIsOpenAdd(false)} 
          onSuccess={() => setRefetchProducts(!refetchProducts)}
        />
      )}
    </>
  );
};

export default Merchant;
