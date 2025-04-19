import React from "react";
import Customer from "@/components/customer";
import Merchant from "@/components/merchant";

const Home = async ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = await params;

  switch (role) {
    case "customer":
      return <Customer role={role} />;
    case "merchant":
      return <Merchant role={role} />;
    default:
      return <div>Invalid Role</div>;
  }
};

export default Home;
