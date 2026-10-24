import { useRef } from "react";
import { WelcomeHeader } from "../../components/dashboard/WelcomeHeader";
import { CheckInForms } from "../../components/dashboard/CheckInForms";
import {
  CartProducts,
  type CartProductsRef,
} from "../../components/dashboard/CartProducts";
import { LabTestInstructions } from "../../components/dashboard/LabTestInstructions";

export function Dashboard() {
  const cartProductsRef = useRef<CartProductsRef>(null);

  const handleFormCompleted = async () => {
    // Refresh CartProducts when form is completed
    if (cartProductsRef.current) {
      await cartProductsRef.current.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <WelcomeHeader />
      {/* <LabTestInstructions /> */}
      <CheckInForms onFormCompleted={handleFormCompleted} />
      <CartProducts ref={cartProductsRef} />
    </div>
  );
}
