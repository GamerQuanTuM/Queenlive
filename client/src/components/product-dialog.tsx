import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
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

type ProductDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  product?: Product;
  onSuccess?: () => void;
};

const ProductDialog = ({
  isOpen,
  onClose,
  isEdit,
  product,
  onSuccess,
}: ProductDialogProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      quantity: formData.get("quantity"),
      price: formData.get("price"),
    };

    if (isEdit) {
      axiosInstance
        .patch(`/product/${product?.id}`, productData)
        .then((res) => {
          if (res.status === 200) {
            onClose();
            toast.success("Product updated successfully");
            if (onSuccess) onSuccess();
          }
        });
    } else {
      axiosInstance
        .post("/product", productData)
        .then((res) => {
          if (res.status === 201) {
            onClose();
            toast.success("Product created successfully");
            if (onSuccess) onSuccess();
          }
        });
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Please edit the following fields to edit the product"
              : "Please fill in the following fields to add a product"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                defaultValue={product?.name}
                id="name"
                name="name"
                placeholder="Enter Product Name"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                defaultValue={product?.description ?? ""}
                id="description"
                name="description"
                placeholder="Enter Product Description"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                defaultValue={product?.quantity}
                type="number"
                id="quantity"
                name="quantity"
                placeholder="Enter No of Quantity"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                defaultValue={product?.price}
                type="number"
                id="price"
                name="price"
                placeholder="Enter Product Price"
              />
            </div>
          </div>
          <div className="flex justify-center pt-6">
            <Button type="submit">{isEdit ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
